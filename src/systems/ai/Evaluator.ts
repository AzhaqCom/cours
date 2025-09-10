import type { CombatEntityInstance } from '../../types/CombatEntity';
import type { CombatState } from '../combat/CombatManager';
import type { AIDecision } from './AICore';
import { DEFAULT_AI_CONFIG, type AIConfig } from './AIConfig';
import type { Position } from '../combat/Grid';

// Évaluateur de menaces pour l'IA
export class ThreatEvaluator {
    private config: AIConfig;

    constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
        this.config = config;
    }

    // Évaluer le niveau de menace d'une entité
    evaluateThreat(entity: CombatEntityInstance, fromPerspectiveOf: CombatEntityInstance, combatState: CombatState): number {
        let threat = 0;

        // Facteur de base selon les HP (plus de HP = plus menaçant)
        const healthFactor = entity.currentHp / entity.entity.maxHp;
        threat += healthFactor * this.config.threat.healthFactor;

        // Potentiel d'attaque
        threat += entity.entity.attackBonus * this.config.threat.attackBonusMultiplier;
        threat += entity.entity.damageBonus * this.config.threat.damageBonusMultiplier;

        // Potentiel magique
        if (entity.entity.spellIds && entity.entity.spellIds.length > 0) {
            threat += entity.entity.spellIds.length * this.config.threat.spellCountMultiplier;
            if (entity.entity.spellModifier) {
                threat += entity.entity.spellModifier * this.config.threat.spellModifierMultiplier;
            }
        }

        // Facteur de distance - logique corrigée
        const distance = this.getDistance(entity, fromPerspectiveOf, combatState);
        threat += this.calculateDistanceThreat(distance);

        // Modificateur selon le rôle
        threat += this.calculateRoleThreat(entity.entity.aiRole, distance);

        return Math.max(0, threat);
    }

    // Calculer la menace selon la distance
    private calculateDistanceThreat(distance: number): number {
        const cfg = this.config.threat;
        
        if (distance <= this.config.ranges.immediateRange) {
            return cfg.immediateRangeBonus; // Menace immédiate
        } else if (distance <= this.config.ranges.closeRange) {
            return cfg.closeRangeBonus; // Menace proche
        } else {
            // Menace diminue progressivement (mais jamais négative)
            const reduction = (distance - this.config.ranges.closeRange) * cfg.distanceReductionRate;
            return Math.max(0, cfg.closeRangeBonus - reduction);
        }
    }

    // Calculer la menace selon le rôle et la distance
    private calculateRoleThreat(role: string, distance: number): number {
        const roleModifiers = this.config.threat.roleModifiers;
        
        switch (role) {
            case 'archer':
                return distance > 2 ? roleModifiers.archer.distant : roleModifiers.archer.close;
            case 'caster':
                return roleModifiers.caster;
            case 'tank':
                return distance <= 2 ? roleModifiers.tank.close : roleModifiers.tank.distant;
            case 'skirmisher':
                return roleModifiers.skirmisher;
            case 'support':
                return roleModifiers.support; // Toujours haute priorité
            default:
                return roleModifiers.default;
        }
    }

    // Obtenir les entités les plus menaçantes
    getMostThreateningEntities(entities: CombatEntityInstance[], fromPerspectiveOf: CombatEntityInstance, combatState: CombatState, limit: number = 3): CombatEntityInstance[] {
        const threatsWithScores = entities.map(entity => ({
            entity,
            threat: this.evaluateThreat(entity, fromPerspectiveOf, combatState)
        }));

        threatsWithScores.sort((a, b) => b.threat - a.threat);

        return threatsWithScores.slice(0, limit).map(item => item.entity);
    }

    private getDistance(entity1: CombatEntityInstance, entity2: CombatEntityInstance, combatState: CombatState): number {
        const pos1 = combatState.grid.getEntityPosition(entity1.instanceId);
        const pos2 = combatState.grid.getEntityPosition(entity2.instanceId);

        if (!pos1 || !pos2) return 999;

        return combatState.grid.getDistance(pos1, pos2);
    }
}

// Évaluateur de positions tactiques
export class PositionEvaluator {
    private config: AIConfig;

    constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
        this.config = config;
    }
    // Évaluer la qualité d'une position pour une entité
    evaluatePosition(position: { x: number; y: number }, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = 0;

        // Évaluer la sécurité de la position
        score += this.evaluateSafety(position, entity, combatState);

        // Évaluer les opportunités d'attaque
        score += this.evaluateOffensiveOpportunities(position, entity, combatState);

        // Évaluer le support aux alliés
        score += this.evaluateAllySupport(position, entity, combatState);

        // Évaluer la mobilité future
        score += this.evaluateMobility(position, entity, combatState);

        return score;
    }

    // Évaluer la sécurité d'une position
    private evaluateSafety(position: Position, entity: CombatEntityInstance, combatState: CombatState): number {
        let safety = this.config.position.baseSafetyScore;

        // Pénalité pour les ennemis proches
        const nearbyEnemies = this.getEnemiesInRange(position, entity, combatState, this.config.ranges.positionEvaluation);
        safety -= nearbyEnemies.length * this.config.position.enemyProximityPenalty;

        // Bonus protection par les bords
        const isNearEdge = position.x === 0 || position.x === combatState.grid.width - 1 ||
                          position.y === 0 || position.y === combatState.grid.height - 1;
        if (isNearEdge) {
            safety += this.config.position.edgeProtectionBonus;
        }

        // Bonus protection par les coins (protection maximale)
        const isInCorner = (position.x === 0 || position.x === combatState.grid.width - 1) &&
                          (position.y === 0 || position.y === combatState.grid.height - 1);
        if (isInCorner) {
            safety += this.config.position.cornerProtectionBonus;
        }

        return safety;
    }

    // Évaluer les opportunités d'attaque depuis cette position
    private evaluateOffensiveOpportunities(position: Position, entity: CombatEntityInstance, combatState: CombatState): number {
        let opportunities = 0;

        const enemies = this.getEnemiesInRange(position, entity, combatState, this.config.ranges.longRange);

        enemies.forEach(enemy => {
            const enemyPos = combatState.grid.getEntityPosition(enemy.instanceId);
            if (!enemyPos) return;

            const distance = combatState.grid.getDistance(position, enemyPos);
            
            // Score selon la portée optimale du rôle (depuis config)
            const roleBonus = this.calculateRoleOffensiveBonus(entity.entity.aiRole, distance);
            opportunities += roleBonus;

            // Bonus pour cibler les ennemis blessés
            const healthPercent = enemy.currentHp / enemy.entity.maxHp;
            if (healthPercent < this.config.health.low) {
                opportunities += 8; // Cible prioritaire
            }
        });

        return opportunities;
    }

    // Calculer le bonus offensif selon le rôle et la distance
    private calculateRoleOffensiveBonus(role: string, distance: number): number {
        const cfg = this.config.position.offensiveBonus;

        switch (role) {
            case 'archer':
                return (distance >= cfg.archer.minRange && distance <= cfg.archer.maxRange) ? cfg.archer.bonus : 0;
            case 'caster':
                return (distance >= cfg.caster.minRange && distance <= cfg.caster.maxRange) ? cfg.caster.bonus : 0;
            case 'skirmisher':
            case 'tank':
                return distance <= cfg.melee.maxRange ? cfg.melee.bonus : 0;
            default:
                return distance <= cfg.default.maxRange ? cfg.default.bonus : 0;
        }
    }

    // Évaluer le support qu'on peut apporter aux alliés depuis cette position
    private evaluateAllySupport(position: Position, entity: CombatEntityInstance, combatState: CombatState): number {
        let support = 0;

        const allies = this.getAlliesInRange(position, entity, combatState, this.config.ranges.allySupport);

        allies.forEach(ally => {
            const healthPercent = ally.currentHp / ally.entity.maxHp;
            
            // Bonus pour être près d'alliés blessés (pour les supports)
            if (entity.entity.aiRole === 'support') {
                if (healthPercent < this.config.position.criticalHealthThreshold) {
                    support += this.config.position.allySupport.healingUrgentBonus;
                } else if (healthPercent < this.config.position.lowHealthThreshold) {
                    support += this.config.position.allySupport.healingMediumBonus;
                }
            }

            // Bonus général pour cohésion d'équipe
            support += this.config.position.allySupport.cohesionBonus;
        });

        // Bonus spécial pour les tanks près des alliés fragiles
        if (entity.entity.aiRole === 'tank') {
            const fragileAllies = allies.filter(ally => 
                ally.entity.aiRole === 'caster' || ally.entity.aiRole === 'support'
            );
            support += fragileAllies.length * this.config.position.allySupport.tankProtectionBonus;
        }

        return support;
    }

    // Évaluer la mobilité tactique depuis cette position
    private evaluateMobility(position: Position, entity: CombatEntityInstance, combatState: CombatState): number {
        let mobility = 0;

        // 1. Évaluer les options de mouvement stratégiques
        const accessiblePositions = combatState.grid.getAccessiblePositions(position, entity.entity.movement);
        mobility += accessiblePositions.length * this.config.position.mobilityPerExit;

        // 2. Évaluer les routes d'évasion (positions sans ennemis adjacents)
        const escapeRoutes = this.countEscapeRoutes(position, combatState, entity);
        mobility += escapeRoutes * 5; // Routes d'évasion sont critiques

        // 3. Évaluer les opportunités de flanquement
        const flankingOpportunities = this.evaluateFlankingOpportunities(position, combatState, entity);
        mobility += flankingOpportunities;

        // 4. Pénalité si mobilité trop réduite (position piège)
        if (accessiblePositions.length <= 3) {
            mobility -= this.config.position.lowMobilityPenalty;
        }

        return Math.max(0, mobility);
    }

    // Compter les routes d'évasion (positions où on peut fuir sans être attaqué)
    private countEscapeRoutes(position: Position, combatState: CombatState, entity: CombatEntityInstance): number {
        const accessiblePositions = combatState.grid.getAccessiblePositions(position, entity.entity.movement);
        
        return accessiblePositions.filter(pos => {
            // Une route d'évasion = position accessible sans ennemis adjacents
            const nearbyEnemies = this.getEnemiesInRange(pos, entity, combatState, 1);
            return nearbyEnemies.length === 0;
        }).length;
    }

    // Évaluer les opportunités de flanquement depuis cette position
    private evaluateFlankingOpportunities(position: Position, combatState: CombatState, entity: CombatEntityInstance): number {
        let flanking = 0;
        const enemies = this.getEnemiesInRange(position, entity, combatState, this.config.ranges.closeRange);

        enemies.forEach(enemy => {
            const enemyPos = combatState.grid.getEntityPosition(enemy.instanceId);
            if (!enemyPos) return;

            // Bonus si on peut attaquer un ennemi qui fait face à un allié
            const allies = this.getAlliesInRange(enemyPos, entity, combatState, 1);
            if (allies.length > 0) {
                flanking += 8; // Opportunité de flanquement
            }

            // Bonus si on peut attaquer un ennemi isolé
            const enemyAllies = this.getEnemiesInRange(enemyPos, entity, combatState, 1);
            if (enemyAllies.length === 0) {
                flanking += 5; // Ennemi isolé
            }
        });

        return flanking;
    }

    // Obtenir les meilleurs positions pour une entité
    getBestPositions(entity: CombatEntityInstance, combatState: CombatState, limit: number = 5): Array<{ position: { x: number; y: number }, score: number }> {
        const positions: Array<{ position: { x: number; y: number }, score: number }> = [];

        // Évaluer toutes les positions accessibles
        const currentPos = combatState.grid.getEntityPosition(entity.instanceId);
        if (!currentPos) return positions;

        const accessiblePositions = combatState.grid.getAccessiblePositions(currentPos, entity.entity.movement);

        accessiblePositions.forEach(pos => {
            const score = this.evaluatePosition(pos, entity, combatState);
            positions.push({ position: pos, score });
        });

        // Trier par score décroissant
        positions.sort((a, b) => b.score - a.score);

        return positions.slice(0, limit);
    }

    private getEnemiesInRange(position: { x: number; y: number }, entity: CombatEntityInstance, combatState: CombatState, range: number): CombatEntityInstance[] {
        const enemies: CombatEntityInstance[] = [];
        const enemyIds = combatState.enemyEntities.includes(entity.instanceId) 
            ? [...combatState.playerEntities, ...combatState.companionEntities]
            : combatState.enemyEntities;

        enemyIds.forEach(id => {
            const enemy = combatState.entities.get(id);
            const enemyPos = combatState.grid.getEntityPosition(id);
            
            if (enemy && enemy.isAlive && enemyPos) {
                const distance = combatState.grid.getDistance(position, enemyPos);
                if (distance <= range) {
                    enemies.push(enemy);
                }
            }
        });

        return enemies;
    }

    private getAlliesInRange(position: { x: number; y: number }, entity: CombatEntityInstance, combatState: CombatState, range: number): CombatEntityInstance[] {
        const allies: CombatEntityInstance[] = [];
        const allyIds = combatState.enemyEntities.includes(entity.instanceId)
            ? combatState.enemyEntities
            : [...combatState.playerEntities, ...combatState.companionEntities];

        allyIds.forEach(id => {
            if (id === entity.instanceId) return; // Pas soi-même
            
            const ally = combatState.entities.get(id);
            const allyPos = combatState.grid.getEntityPosition(id);
            
            if (ally && ally.isAlive && allyPos) {
                const distance = combatState.grid.getDistance(position, allyPos);
                if (distance <= range) {
                    allies.push(ally);
                }
            }
        });

        return allies;
    }
}

// Évaluateur de priorités générales
export class PriorityEvaluator {
    private config: AIConfig;

    constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
        this.config = config;
    }
    // Calculer la priorité d'une action selon le contexte général
    evaluateActionPriority(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let priority = decision.priority;

        // Modificateurs selon l'état de santé de l'entité
        const healthPercent = entity.currentHp / entity.entity.maxHp;
        priority += this.calculateHealthModifiers(decision, healthPercent);

        // Modificateurs selon la situation numérique
        const aliveAllies = this.countAliveAllies(entity, combatState);
        const aliveEnemies = this.countAliveEnemies(entity, combatState);
        priority += this.calculateNumericalModifiers(decision, aliveAllies, aliveEnemies);

        return priority;
    }

    // Calculer les modificateurs selon l'état de santé
    private calculateHealthModifiers(decision: AIDecision, healthPercent: number): number {
        let modifier = 0;
        
        // Si très blessé, priorité à la survie
        if (healthPercent < this.config.priority.survivalThreshold) {
            switch (decision.action) {
                case 'defend':
                    modifier += this.config.priority.defenseBonus;
                    break;
                case 'move':
                    modifier += this.config.priority.fleeBonus; // Fuir
                    break;
                case 'cast':
                    // Bonus énorme pour les soins d'urgence
                    if (this.isHealingSpell(decision.spellId)) {
                        modifier += this.config.priority.healingUrgentBonus;
                    }
                    break;
            }
        }

        return modifier;
    }

    // Calculer les modificateurs selon la situation numérique
    private calculateNumericalModifiers(decision: AIDecision, aliveAllies: number, aliveEnemies: number): number {
        let modifier = 0;

        // Si en infériorité numérique, plus prudent
        if (aliveAllies < aliveEnemies) {
            switch (decision.action) {
                case 'defend':
                    modifier += this.config.priority.outnumberedDefenseBonus;
                    break;
                case 'move':
                    modifier += this.config.priority.outnumberedMoveBonus;
                    break;
            }
        }

        // Si en supériorité, plus agressif
        if (aliveAllies > aliveEnemies) {
            switch (decision.action) {
                case 'attack':
                    modifier += this.config.priority.advantageAttackBonus;
                    break;
                case 'cast':
                    if (!this.isHealingSpell(decision.spellId)) {
                        modifier += this.config.priority.advantageCastBonus;
                    }
                    break;
            }
        }

        return modifier;
    }

    // Vérifier si un sort est un sort de soin (logique plus robuste)
    private isHealingSpell(spellId?: string): boolean {
        if (!spellId) return false;
        
        // TODO: Intégrer avec la vraie base de données des sorts
        const healingKeywords = ['heal', 'cure', 'restore', 'regenerate', 'mend'];
        return healingKeywords.some(keyword => spellId.toLowerCase().includes(keyword));
    }

    private countAliveAllies(entity: CombatEntityInstance, combatState: CombatState): number {
        const allyIds = combatState.enemyEntities.includes(entity.instanceId)
            ? combatState.enemyEntities
            : [...combatState.playerEntities, ...combatState.companionEntities];

        return allyIds.filter(id => {
            const ally = combatState.entities.get(id);
            return ally && ally.isAlive;
        }).length;
    }

    private countAliveEnemies(entity: CombatEntityInstance, combatState: CombatState): number {
        const enemyIds = combatState.enemyEntities.includes(entity.instanceId) 
            ? [...combatState.playerEntities, ...combatState.companionEntities]
            : combatState.enemyEntities;

        return enemyIds.filter(id => {
            const enemy = combatState.entities.get(id);
            return enemy && enemy.isAlive;
        }).length;
    }
}