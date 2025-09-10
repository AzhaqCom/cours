import { AIController } from './ai/AICore';
import { SkirmisherBehavior, ArcherBehavior, TankBehavior, CasterBehavior, SupportBehavior } from './ai/Behaviors';
import { ThreatEvaluator } from './ai/Evaluator';
import { DEFAULT_AI_CONFIG, type AIConfig } from './ai/AIConfig';
// import type { Companion } from '../types/Companion';
import type { CombatEntityInstance } from '../types/CombatEntity';
import type { CombatState } from './combat/CombatManager';
import type { AIDecision } from './ai/AICore';

// Configuration spécifique aux compagnons
export interface CompanionAIConfig extends AIConfig {
    // Modificateurs pour rendre les compagnons plus intelligents/prudents que les ennemis
    companion: {
        survivalModifier: number;      // Bonus priorité survie (+20%)
        teamworkModifier: number;      // Bonus cohésion équipe (+15%)
        riskAversionModifier: number;  // Réduction prise de risque (-10%)
    };
}

// Configuration par défaut pour les compagnons (plus prudents/intelligents)
export const DEFAULT_COMPANION_AI_CONFIG: CompanionAIConfig = {
    ...DEFAULT_AI_CONFIG,
    
    // Compagnons plus prudents
    priority: {
        ...DEFAULT_AI_CONFIG.priority,
        survivalThreshold: 0.35,           // Survie dès 35% (vs 25% ennemis)
        defenseBonus: 40,                  // +10 bonus défense
        fleeBonus: 30,                     // +10 bonus fuite
        healingUrgentBonus: 50,            // +10 bonus soins
        outnumberedDefenseBonus: 20,       // +5 bonus défense si infériorité
        outnumberedMoveBonus: 15,          // +5 bonus mouvement prudent
    },

    // Positions plus sûres
    position: {
        ...DEFAULT_AI_CONFIG.position,
        enemyProximityPenalty: 15,         // +5 pénalité exposition
        allySupport: {
            ...DEFAULT_AI_CONFIG.position.allySupport,
            cohesionBonus: 5,              // +2 bonus cohésion
            tankProtectionBonus: 12,       // +4 bonus protection tank
        }
    },

    companion: {
        survivalModifier: 1.2,
        teamworkModifier: 1.15,
        riskAversionModifier: 0.9
    }
};

// Gestionnaire AI spécialisé pour les compagnons
export class CompanionAIManager {
    private aiController: AIController;
    private threatEvaluator: ThreatEvaluator;
    // private positionEvaluator: PositionEvaluator;
    // private priorityEvaluator: PriorityEvaluator;
    private config: CompanionAIConfig;

    constructor(config: CompanionAIConfig = DEFAULT_COMPANION_AI_CONFIG) {
        this.config = config;
        this.aiController = new AIController();
        this.threatEvaluator = new ThreatEvaluator(config);
        // this.positionEvaluator = new PositionEvaluator(config);
        // this.priorityEvaluator = new PriorityEvaluator(config);

        // Enregistrer les comportements adaptés pour compagnons
        this.registerCompanionBehaviors();
    }

    // Prendre une décision AI pour un compagnon
    decideForCompanion(companion: CombatEntityInstance, combatState: CombatState): AIDecision {
        // Utiliser le système AI standard mais avec modifications pour compagnons
        const baseDecision = this.aiController.decide(companion, combatState);
        
        // Appliquer les modificateurs de compagnons
        const modifiedDecision = this.applyCompanionModifiers(baseDecision, companion, combatState);
        
        return modifiedDecision;
    }

    // Évaluer si un compagnon a besoin d'aide urgente
    needsUrgentHelp(companion: CombatEntityInstance, combatState: CombatState): {
        needsHelp: boolean;
        priority: 'low' | 'medium' | 'high' | 'critical';
        reason: string;
    } {
        const healthPercent = companion.currentHp / companion.entity.maxHp;
        
        // Santé critique
        if (healthPercent < 0.15) {
            return {
                needsHelp: true,
                priority: 'critical',
                reason: 'Santé critique'
            };
        }

        // Entouré d'ennemis
        const companionPos = combatState.grid.getEntityPosition(companion.instanceId);
        if (companionPos) {
            const nearbyEnemies = this.threatEvaluator.getMostThreateningEntities(
                this.getEnemyEntities(companion, combatState),
                companion,
                combatState,
                5
            ).filter(enemy => {
                const enemyPos = combatState.grid.getEntityPosition(enemy.instanceId);
                return enemyPos && combatState.grid.getDistance(companionPos, enemyPos) <= 2;
            });

            if (nearbyEnemies.length >= 3) {
                return {
                    needsHelp: true,
                    priority: 'high',
                    reason: 'Entouré d\'ennemis'
                };
            }

            if (nearbyEnemies.length >= 2 && healthPercent < 0.4) {
                return {
                    needsHelp: true,
                    priority: 'medium',
                    reason: 'Exposé et blessé'
                };
            }
        }

        // Santé basse
        if (healthPercent < 0.3) {
            return {
                needsHelp: true,
                priority: 'medium',
                reason: 'Santé basse'
            };
        }

        return {
            needsHelp: false,
            priority: 'low',
            reason: 'Situation stable'
        };
    }

    // Obtenir les compagnons qui peuvent aider un autre
    getCompanionsWhoCanHelp(
        needyCompanion: CombatEntityInstance, 
        allCompanions: CombatEntityInstance[], 
        combatState: CombatState
    ): Array<{
        helper: CombatEntityInstance;
        helpType: 'heal' | 'protect' | 'rescue';
        effectiveness: number;
    }> {
        const helpers: Array<{
            helper: CombatEntityInstance;
            helpType: 'heal' | 'protect' | 'rescue';
            effectiveness: number;
        }> = [];

        const needyPos = combatState.grid.getEntityPosition(needyCompanion.instanceId);
        if (!needyPos) return helpers;

        allCompanions.forEach(companion => {
            if (companion.instanceId === needyCompanion.instanceId) return;
            if (!companion.isAlive) return;

            const companionPos = combatState.grid.getEntityPosition(companion.instanceId);
            if (!companionPos) return;

            const distance = combatState.grid.getDistance(needyPos, companionPos);

            // Vérifier capacité de soins
            if (companion.entity.spellIds?.some(spell => spell.includes('heal'))) {
                helpers.push({
                    helper: companion,
                    helpType: 'heal',
                    effectiveness: Math.max(0, 100 - distance * 10) // Moins efficace si loin
                });
            }

            // Vérifier capacité de protection (tanks)
            if (companion.entity.aiRole === 'tank' && distance <= 4) {
                helpers.push({
                    helper: companion,
                    helpType: 'protect',
                    effectiveness: Math.max(0, 80 - distance * 15)
                });
            }

            // Vérifier capacité de rescue (haute mobilité)
            if ((companion.entity.aiRole === 'skirmisher' || companion.entity.movement >= 6) && distance <= 6) {
                helpers.push({
                    helper: companion,
                    helpType: 'rescue',
                    effectiveness: Math.max(0, 70 - distance * 10)
                });
            }
        });

        // Trier par efficacité
        helpers.sort((a, b) => b.effectiveness - a.effectiveness);

        return helpers;
    }

    // Coordonner les actions entre compagnons
    coordinateCompanions(companions: CombatEntityInstance[], combatState: CombatState): Map<string, AIDecision> {
        const decisions = new Map<string, AIDecision>();
        
        // 1. Identifier les compagnons en détresse
        const needyCompanions = companions.filter(c => {
            const help = this.needsUrgentHelp(c, combatState);
            return help.needsHelp && (help.priority === 'critical' || help.priority === 'high');
        });

        // 2. Assigner des helpers aux compagnons en détresse
        const assignments = new Map<string, string>(); // helperId -> needyId

        needyCompanions.forEach(needy => {
            const helpers = this.getCompanionsWhoCanHelp(needy, companions, combatState);
            
            // Trouver le meilleur helper disponible
            const availableHelper = helpers.find(h => !assignments.has(h.helper.instanceId));
            
            if (availableHelper) {
                assignments.set(availableHelper.helper.instanceId, needy.instanceId);
                
                // Créer une décision d'aide
                const helpDecision = this.createHelpDecision(
                    availableHelper.helper, 
                    needy, 
                    availableHelper.helpType, 
                    combatState
                );
                
                if (helpDecision) {
                    decisions.set(availableHelper.helper.instanceId, helpDecision);
                }
            }
        });

        // 3. Décisions normales pour les autres compagnons
        companions.forEach(companion => {
            if (!decisions.has(companion.instanceId)) {
                const decision = this.decideForCompanion(companion, combatState);
                decisions.set(companion.instanceId, decision);
            }
        });

        return decisions;
    }

    // Méthodes privées
    private registerCompanionBehaviors(): void {
        // Utiliser les mêmes behaviors mais avec config compagnons
        this.aiController.registerEvaluator('skirmisher', new SkirmisherBehavior(this.config));
        this.aiController.registerEvaluator('archer', new ArcherBehavior(this.config));
        this.aiController.registerEvaluator('tank', new TankBehavior(this.config));
        this.aiController.registerEvaluator('caster', new CasterBehavior(this.config));
        this.aiController.registerEvaluator('support', new SupportBehavior(this.config));
    }

    private applyCompanionModifiers(decision: AIDecision, companion: CombatEntityInstance, _combatState: CombatState): AIDecision {
        const modifiedDecision = { ...decision };

        // Appliquer les modificateurs de compagnons
        const healthPercent = companion.currentHp / companion.entity.maxHp;

        // Modificateur de survie
        if (healthPercent < this.config.priority.survivalThreshold) {
            if (decision.action === 'defend' || decision.action === 'move') {
                modifiedDecision.priority = Math.floor(decision.priority * this.config.companion.survivalModifier);
            }
        }

        // Modificateur de travail d'équipe
        if (decision.action === 'cast' && decision.target && this.isAlly(decision.target, companion, _combatState)) {
            modifiedDecision.priority = Math.floor(decision.priority * this.config.companion.teamworkModifier);
        }

        // Modificateur d'aversion au risque
        if (decision.action === 'attack' || (decision.action === 'move' && this.isRiskyPosition(decision.position, _combatState))) {
            modifiedDecision.priority = Math.floor(decision.priority * this.config.companion.riskAversionModifier);
        }

        // Ajouter contexte de raisonnement
        modifiedDecision.reasoning = `${decision.reasoning || 'Décision de base'} (modifiée pour compagnon)`;

        return modifiedDecision;
    }

    private createHelpDecision(
        helper: CombatEntityInstance, 
        needy: CombatEntityInstance, 
        helpType: 'heal' | 'protect' | 'rescue', 
        combatState: CombatState
    ): AIDecision | null {
        switch (helpType) {
            case 'heal':
                const healSpell = helper.entity.spellIds?.find(spell => spell.includes('heal'));
                if (healSpell) {
                    return {
                        action: 'cast',
                        target: needy.instanceId,
                        spellId: healSpell,
                        priority: 90,
                        reasoning: `Soigner ${needy.entity.name} en urgence`
                    };
                }
                break;

            case 'protect':
                const needyPos = combatState.grid.getEntityPosition(needy.instanceId);
                if (needyPos) {
                    // Trouver une position entre le tank et les ennemis menaçants
                    const protectPosition = this.findProtectionPosition(helper, needy, combatState);
                    if (protectPosition) {
                        return {
                            action: 'move',
                            position: protectPosition,
                            priority: 85,
                            reasoning: `Se positionner pour protéger ${needy.entity.name}`
                        };
                    }
                }
                break;

            case 'rescue':
                // Se rapprocher pour aide ou diversion
                const needyPosition = combatState.grid.getEntityPosition(needy.instanceId);
                if (needyPosition) {
                    const rescuePosition = this.findRescuePosition(helper, needy, combatState);
                    if (rescuePosition) {
                        return {
                            action: 'move',
                            position: rescuePosition,
                            priority: 80,
                            reasoning: `Secourir ${needy.entity.name}`
                        };
                    }
                }
                break;
        }

        return null;
    }

    private findProtectionPosition(protector: CombatEntityInstance, protectedEntity: CombatEntityInstance, combatState: CombatState): { x: number; y: number } | null {
        // TODO: Implémenter logique de positionnement tactique
        // Pour le moment, se rapprocher simplement
        const protectedPos = combatState.grid.getEntityPosition(protectedEntity.instanceId);
        const protectorPos = combatState.grid.getEntityPosition(protector.instanceId);
        
        if (!protectedPos || !protectorPos) return null;

        // Trouver positions accessibles près de l'allié protégé
        const accessiblePositions = combatState.grid.getAccessiblePositions(protectorPos, protector.entity.movement);
        
        // Choisir la plus proche de l'allié
        let bestPosition: { x: number; y: number } | null = null;
        let bestDistance = Infinity;

        accessiblePositions.forEach(pos => {
            const distance = combatState.grid.getDistance(pos, protectedPos);
            if (distance < bestDistance && distance <= 2) {
                bestPosition = pos;
                bestDistance = distance;
            }
        });

        return bestPosition;
    }

    private findRescuePosition(rescuer: CombatEntityInstance, _rescued: CombatEntityInstance, combatState: CombatState): { x: number; y: number } | null {
        // Même logique que protection pour le moment
        return this.findProtectionPosition(rescuer, _rescued, combatState);
    }

    private getEnemyEntities(_companion: CombatEntityInstance, combatState: CombatState): CombatEntityInstance[] {
        const enemies: CombatEntityInstance[] = [];
        
        // Les compagnons ciblent toujours les ennemis
        combatState.enemyEntities.forEach(id => {
            const enemy = combatState.entities.get(id);
            if (enemy && enemy.isAlive) {
                enemies.push(enemy);
            }
        });

        return enemies;
    }

    private isAlly(targetId: string, _companion: CombatEntityInstance, combatState: CombatState): boolean {
        return combatState.playerEntities.includes(targetId) || 
               combatState.companionEntities.includes(targetId);
    }

    private isRiskyPosition(position: { x: number; y: number } | undefined, _combatState: CombatState): boolean {
        if (!position) return false;
        
        // Position risquée si beaucoup d'ennemis autour
        let nearbyEnemies = 0;
        _combatState.enemyEntities.forEach(enemyId => {
            const enemyPos = _combatState.grid.getEntityPosition(enemyId);
            if (enemyPos) {
                const distance = _combatState.grid.getDistance(position, enemyPos);
                if (distance <= 2) nearbyEnemies++;
            }
        });

        return nearbyEnemies >= 2;
    }
}