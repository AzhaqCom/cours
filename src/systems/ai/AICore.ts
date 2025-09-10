import type { CombatEntityInstance } from '../../types/CombatEntity';
import type { CombatState } from '../combat/CombatManager';
import type { ActionType } from '../combat/Actions';
import type { Position } from '../combat/Grid';

// Décision prise par l'IA
export interface AIDecision {
    action: ActionType;
    target?: string;  // ID de l'entité cible
    position?: Position;  // Position cible (pour movement)
    weaponId?: string;  // Arme à utiliser
    spellId?: string;  // Sort à lancer
    priority: number;  // Score de priorité (0-100)
    reasoning?: string;  // Explication du choix (debug)
}

// Option d'action évaluée par l'IA
export interface ActionOption {
    decision: AIDecision;
    score: number;  // Score calculé par l'évaluateur
    feasible: boolean;  // Action réalisable ?
}

// Contrôleur principal de l'IA
export class AIController {
    private evaluators: Map<string, AIEvaluator> = new Map();

    // Enregistrer un évaluateur pour un rôle d'IA
    registerEvaluator(role: string, evaluator: AIEvaluator): void {
        this.evaluators.set(role, evaluator);
    }

    // Prendre une décision pour une entité
    decide(entity: CombatEntityInstance, combatState: CombatState): AIDecision {
        const evaluator = this.evaluators.get(entity.entity.aiRole);
        
        if (!evaluator) {
            // IA par défaut si aucun évaluateur spécifique
            return this.getDefaultDecision(entity, combatState);
        }

        // Obtenir toutes les options possibles
        const options = this.generateActionOptions(entity, combatState);
        
        // Évaluer chaque option
        const evaluatedOptions = options.map(option => ({
            ...option,
            score: evaluator.evaluateAction(option.decision, entity, combatState)
        }));

        // Filtrer les options réalisables
        const feasibleOptions = evaluatedOptions.filter(opt => opt.feasible);
        
        if (feasibleOptions.length === 0) {
            return { action: 'end_turn', priority: 0, reasoning: 'Aucune action possible' };
        }

        // Prendre la meilleure option
        const bestOption = feasibleOptions.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        return bestOption.decision;
    }

    // Générer toutes les options d'action possibles
    private generateActionOptions(entity: CombatEntityInstance, combatState: CombatState): ActionOption[] {
        const options: ActionOption[] = [];
        const entityPosition = combatState.grid.getEntityPosition(entity.instanceId);

        if (!entityPosition) return options;

        // Option: Fin de tour (toujours disponible)
        options.push({
            decision: {
                action: 'end_turn',
                priority: 10,
                reasoning: 'Terminer le tour'
            },
            score: 0,
            feasible: true
        });

        // Option: Mouvement (si pas encore bougé)
        if (!entity.hasMoved) {
            const accessiblePositions = combatState.grid.getAccessiblePositions(
                entityPosition, 
                entity.entity.movement
            );

            accessiblePositions.forEach(pos => {
                options.push({
                    decision: {
                        action: 'move',
                        position: pos,
                        priority: 30,
                        reasoning: `Se déplacer vers (${pos.x}, ${pos.y})`
                    },
                    score: 0,
                    feasible: true
                });
            });
        }

        // Option: Attaque (si pas encore agi et a des armes)
        if (!entity.hasActed && entity.entity.weaponIds.length > 0) {
            const enemies = this.getEnemyEntities(entity, combatState);
            
            entity.entity.weaponIds.forEach(weaponId => {
                enemies.forEach(enemy => {
                    options.push({
                        decision: {
                            action: 'attack',
                            target: enemy.instanceId,
                            weaponId,
                            priority: 70,
                            reasoning: `Attaquer ${enemy.entity.name} avec ${weaponId}`
                        },
                        score: 0,
                        feasible: this.canAttackTarget(entity, enemy, combatState, weaponId)
                    });
                });
            });
        }

        // Option: Sort (si pas encore agi et a des sorts)
        if (!entity.hasActed && entity.entity.spellIds && entity.entity.spellIds.length > 0) {
            entity.entity.spellIds.forEach(spellId => {
                // Sorts offensifs sur ennemis
                const enemies = this.getEnemyEntities(entity, combatState);
                enemies.forEach(enemy => {
                    options.push({
                        decision: {
                            action: 'cast',
                            target: enemy.instanceId,
                            spellId,
                            priority: 60,
                            reasoning: `Lancer ${spellId} sur ${enemy.entity.name}`
                        },
                        score: 0,
                        feasible: this.canCastOnTarget(entity, enemy, combatState, spellId)
                    });
                });

                // Sorts de soin sur alliés
                const allies = this.getAllyEntities(entity, combatState);
                allies.forEach(ally => {
                    if (ally.currentHp < ally.entity.maxHp) {
                        options.push({
                            decision: {
                                action: 'cast',
                                target: ally.instanceId,
                                spellId,
                                priority: 80,
                                reasoning: `Soigner ${ally.entity.name} avec ${spellId}`
                            },
                            score: 0,
                            feasible: this.canCastOnTarget(entity, ally, combatState, spellId)
                        });
                    }
                });

                // Sorts sur soi-même
                options.push({
                    decision: {
                        action: 'cast',
                        target: entity.instanceId,
                        spellId,
                        priority: 50,
                        reasoning: `Lancer ${spellId} sur soi-même`
                    },
                    score: 0,
                    feasible: true
                });
            });
        }

        // Option: Défense (si pas encore agi)
        if (!entity.hasActed) {
            options.push({
                decision: {
                    action: 'defend',
                    priority: 20,
                    reasoning: 'Se défendre'
                },
                score: 0,
                feasible: true
            });
        }

        return options;
    }

    // Obtenir les entités ennemies
    private getEnemyEntities(entity: CombatEntityInstance, combatState: CombatState): CombatEntityInstance[] {
        const enemies: CombatEntityInstance[] = [];
        
        // Si l'entité est un ennemi, cibler les alliés du joueur
        if (combatState.enemyEntities.includes(entity.instanceId)) {
            [...combatState.playerEntities, ...combatState.companionEntities].forEach(id => {
                const target = combatState.entities.get(id);
                if (target && target.isAlive) {
                    enemies.push(target);
                }
            });
        }
        // Sinon, cibler les ennemis
        else {
            combatState.enemyEntities.forEach(id => {
                const target = combatState.entities.get(id);
                if (target && target.isAlive) {
                    enemies.push(target);
                }
            });
        }

        return enemies;
    }

    // Obtenir les entités alliées
    private getAllyEntities(entity: CombatEntityInstance, combatState: CombatState): CombatEntityInstance[] {
        const allies: CombatEntityInstance[] = [];
        
        // Si l'entité est un ennemi, les autres ennemis sont des alliés
        if (combatState.enemyEntities.includes(entity.instanceId)) {
            combatState.enemyEntities.forEach(id => {
                const ally = combatState.entities.get(id);
                if (ally && ally.isAlive && ally.instanceId !== entity.instanceId) {
                    allies.push(ally);
                }
            });
        }
        // Sinon, les compagnons et le joueur sont des alliés
        else {
            [...combatState.playerEntities, ...combatState.companionEntities].forEach(id => {
                const ally = combatState.entities.get(id);
                if (ally && ally.isAlive && ally.instanceId !== entity.instanceId) {
                    allies.push(ally);
                }
            });
        }

        return allies;
    }

    // Vérifier si on peut attaquer une cible
    private canAttackTarget(attacker: CombatEntityInstance, target: CombatEntityInstance, combatState: CombatState, weaponId: string): boolean {
        const attackerPos = combatState.grid.getEntityPosition(attacker.instanceId);
        const targetPos = combatState.grid.getEntityPosition(target.instanceId);

        if (!attackerPos || !targetPos) return false;

        // TODO: Vérifier la portée de l'arme
        const distance = combatState.grid.getDistance(attackerPos, targetPos);
        
        // Pour le moment, portée de 1 pour mêlée, plus pour distance
        const maxRange = weaponId.includes('bow') || weaponId.includes('crossbow') ? 6 : 1;
        
        return distance <= maxRange;
    }

    // Vérifier si on peut lancer un sort sur une cible
    private canCastOnTarget(caster: CombatEntityInstance, target: CombatEntityInstance, combatState: CombatState, _spellId: string): boolean {
        const casterPos = combatState.grid.getEntityPosition(caster.instanceId);
        const targetPos = combatState.grid.getEntityPosition(target.instanceId);

        if (!casterPos || !targetPos) return false;

        // TODO: Vérifier la portée du sort depuis la base de données
        const distance = combatState.grid.getDistance(casterPos, targetPos);
        
        // Portée par défaut
        const maxRange = 6;
        
        return distance <= maxRange;
    }

    // Décision par défaut si aucun évaluateur
    private getDefaultDecision(entity: CombatEntityInstance, combatState: CombatState): AIDecision {
        // IA basique: attaquer le plus proche ou terminer le tour
        const enemies = this.getEnemyEntities(entity, combatState);
        
        if (enemies.length > 0 && !entity.hasActed && entity.entity.weaponIds.length > 0) {
            const target = enemies[0]; // Premier ennemi
            return {
                action: 'attack',
                target: target.instanceId,
                weaponId: entity.entity.weaponIds[0],
                priority: 50,
                reasoning: 'Attaque basique par défaut'
            };
        }

        return {
            action: 'end_turn',
            priority: 10,
            reasoning: 'Aucune action par défaut'
        };
    }
}

// Interface pour les évaluateurs d'IA
export interface AIEvaluator {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number;
}