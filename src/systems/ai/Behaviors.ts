import type { AIEvaluator, AIDecision } from './AICore';
import type { CombatEntityInstance } from '../../types/CombatEntity';
import type { CombatState } from '../combat/CombatManager';
import { AIUtils } from './AIUtils';
import { DEFAULT_AI_CONFIG, type AIConfig } from './AIConfig';

// Classe de base pour tous les comportements d'IA
abstract class BaseBehavior implements AIEvaluator {
    protected config: AIConfig;

    constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
        this.config = config;
    }

    // Évaluation principale - implémentée par chaque comportement
    abstract evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number;

    // Méthodes utilitaires communes
    protected evaluateBasicAttack(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        if (!decision.target) return 0;

        const target = combatState.entities.get(decision.target);
        if (!target) return 0;

        let score = 40; // Score de base

        // Bonus pour cibles blessées
        if (AIUtils.isWounded(target, this.config.health.low)) {
            score += 30;
        }
        if (AIUtils.isCriticalHealth(target, this.config.health.critical)) {
            score += 20; // Bonus supplémentaire pour achever
        }

        // Bonus si à portée optimale
        const distance = AIUtils.getDistanceBetweenEntities(entity, target, combatState);
        if (AIUtils.isOptimalRange(distance, entity.entity.aiRole)) {
            score += 15;
        }

        return score;
    }

    protected evaluateBasicMovement(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        if (!decision.position) return 0;

        let score = 20; // Score de base

        // Évaluer les ennemis proches de la position cible
        const nearbyEnemies = AIUtils.getEnemiesInRange(decision.position, entity, combatState, 2);
        const nearbyAllies = AIUtils.getAlliesInRange(decision.position, entity, combatState, 2);

        // Bonus cohésion avec alliés
        score += nearbyAllies.length * 5;

        // Pénalité exposition aux ennemis (modifiable par rôle)
        score -= this.calculateExposurePenalty(nearbyEnemies.length);

        return score;
    }

    protected evaluateBasicCast(decision: AIDecision, _entity: CombatEntityInstance, combatState: CombatState): number {
        if (!decision.spellId) return 0;

        let score = 35; // Score de base pour casting

        // Évaluation selon le type de sort
        if (AIUtils.isDamageSpell(decision.spellId)) {
            score += this.evaluateDamageSpell(decision, combatState);
        } else if (AIUtils.isHealingSpell(decision.spellId)) {
            score += this.evaluateHealingSpell(decision, combatState);
        }

        return score;
    }

    protected evaluateBasicDefend(entity: CombatEntityInstance, combatState: CombatState): number {
        let score = 15; // Score de base

        // Bonus si blessé
        if (AIUtils.isCriticalHealth(entity, this.config.health.critical)) {
            score += 30;
        } else if (AIUtils.isWounded(entity, this.config.health.low)) {
            score += 15;
        }

        // Bonus si entouré d'ennemis
        const entityPos = combatState.grid.getEntityPosition(entity.instanceId);
        if (entityPos) {
            const nearbyEnemies = AIUtils.getEnemiesInRange(entityPos, entity, combatState, 2);
            score += Math.min(nearbyEnemies.length * 10, 30); // Max +30
        }

        return score;
    }

    // Méthodes protégées spécialisables
    protected calculateExposurePenalty(enemyCount: number): number {
        return enemyCount * 10; // Par défaut, -10 par ennemi
    }

    private evaluateDamageSpell(decision: AIDecision, combatState: CombatState): number {
        if (!decision.target) return 0;

        const target = combatState.entities.get(decision.target);
        if (!target) return 0;

        let bonus = 20;

        // Bonus pour cibles blessées
        if (AIUtils.isWounded(target, this.config.health.low)) {
            bonus += 25;
        }

        return bonus;
    }

    private evaluateHealingSpell(decision: AIDecision, combatState: CombatState): number {
        if (!decision.target) return 0;

        const target = combatState.entities.get(decision.target);
        if (!target) return 0;

        let bonus = 0;

        // Bonus énorme pour soins urgents
        if (AIUtils.isCriticalHealth(target, this.config.health.critical)) {
            bonus += 50;
        } else if (AIUtils.isWounded(target, this.config.health.low)) {
            bonus += 25;
        }

        return bonus;
    }
}

// Comportement Skirmisher: Hit & Run
export class SkirmisherBehavior extends BaseBehavior {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = decision.priority;

        switch (decision.action) {
            case 'attack':
                score += this.evaluateSkirmisherAttack(decision, entity, combatState);
                break;
            case 'move':
                score += this.evaluateSkirmisherMovement(decision, entity, combatState);
                break;
            case 'cast':
                score += this.evaluateBasicCast(decision, entity, combatState);
                break;
            case 'defend':
                score += this.evaluateBasicDefend(entity, combatState);
                break;
            case 'end_turn':
                score = 5;
                break;
        }

        return Math.max(0, score);
    }

    private evaluateSkirmisherAttack(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicAttack(decision, entity, combatState);

        if (decision.target) {
            const target = combatState.entities.get(decision.target);
            if (target && AIUtils.isWounded(target, 0.3)) {
                score += 30; // Priorité pour achever les faibles
            }

            if (target) {
                const distance = AIUtils.getDistanceBetweenEntities(entity, target, combatState);
                if (distance === 1) {
                    score += 20; // Hit & run
                }
            }
        }

        return score;
    }

    private evaluateSkirmisherMovement(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicMovement(decision, entity, combatState);

        if (!decision.position) return score;

        // Bonus pour se rapprocher d'ennemis faibles
        const enemies = AIUtils.getEnemyEntities(entity, combatState);
        enemies.forEach(enemy => {
            if (AIUtils.isWounded(enemy, 0.3)) {
                const enemyPos = combatState.grid.getEntityPosition(enemy.instanceId);
                if (enemyPos) {
                    const distance = combatState.grid.getDistance(decision.position!, enemyPos);
                    if (distance <= 2) {
                        score += 25;
                    }
                }
            }
        });

        return score;
    }

    protected calculateExposurePenalty(enemyCount: number): number {
        return enemyCount * 5; // Skirmisher tolère mieux l'exposition
    }
}

// Comportement Archer: Maintenir la distance
export class ArcherBehavior extends BaseBehavior {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = decision.priority;

        switch (decision.action) {
            case 'attack':
                score += this.evaluateArcherAttack(decision, entity, combatState);
                break;
            case 'move':
                score += this.evaluateArcherMovement(decision, entity, combatState);
                break;
            case 'cast':
                score += this.evaluateBasicCast(decision, entity, combatState);
                break;
            case 'defend':
                score += AIUtils.isCriticalHealth(entity, 0.4) ? 30 : 5;
                break;
            case 'end_turn':
                score = 5;
                break;
        }

        return Math.max(0, score);
    }

    private evaluateArcherAttack(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicAttack(decision, entity, combatState);

        if (decision.target && decision.weaponId) {
            if (AIUtils.isRangedWeapon(decision.weaponId)) {
                score += 40;
            }

            const distance = AIUtils.getDistanceBetweenEntities(entity, 
                combatState.entities.get(decision.target)!, combatState);
            
            if (distance <= 1) {
                score -= 25;
            } else if (distance >= 3 && distance <= 6) {
                score += 20;
            }
        }

        return score;
    }

    private evaluateArcherMovement(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicMovement(decision, entity, combatState);

        if (!decision.position) return score;

        const enemies = AIUtils.getEnemyEntities(entity, combatState);
        let optimalPositioning = true;

        enemies.forEach(enemy => {
            const enemyPos = combatState.grid.getEntityPosition(enemy.instanceId);
            if (enemyPos) {
                const distance = combatState.grid.getDistance(decision.position!, enemyPos);
                
                if (distance >= 3 && distance <= 6) {
                    score += 20;
                } else if (distance <= 1) {
                    score -= 30;
                    optimalPositioning = false;
                }
            }
        });

        if (!optimalPositioning) {
            score += 35; // Priorité à la fuite
        }

        return score;
    }

    protected calculateExposurePenalty(enemyCount: number): number {
        return enemyCount * 15; // Archer évite fortement l'exposition
    }
}

// Comportement Tank: Protéger les alliés  
export class TankBehavior extends BaseBehavior {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = decision.priority;

        switch (decision.action) {
            case 'attack':
                score += this.evaluateTankAttack(decision, entity, combatState);
                break;
            case 'move':
                score += this.evaluateBasicMovement(decision, entity, combatState);
                break;
            case 'defend':
                score += 40;
                break;
            case 'cast':
                if (AIUtils.isHealingSpell(decision.spellId)) {
                    score += 35;
                } else {
                    score += 10;
                }
                break;
            case 'end_turn':
                score = 5;
                break;
        }

        return Math.max(0, score);
    }

    private evaluateTankAttack(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicAttack(decision, entity, combatState);

        if (decision.target) {
            const distance = AIUtils.getDistanceBetweenEntities(entity, 
                combatState.entities.get(decision.target)!, combatState);
            if (distance <= 2) {
                score += 15;
            }
        }

        return score;
    }

    protected calculateExposurePenalty(enemyCount: number): number {
        return Math.max(0, (enemyCount - 2) * 5); // Tank ne craint pas l'exposition
    }
}

// Comportement Caster: Priorité aux sorts
export class CasterBehavior extends BaseBehavior {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = decision.priority;

        switch (decision.action) {
            case 'cast':
                score += this.evaluateCasterSpell(decision, entity, combatState);
                break;
            case 'move':
                score += this.evaluateCasterMovement(decision, entity, combatState);
                break;
            case 'attack':
                score += 10;
                break;
            case 'defend':
                score += AIUtils.isCriticalHealth(entity, 0.3) ? 35 : 15;
                break;
            case 'end_turn':
                score = 5;
                break;
        }

        return Math.max(0, score);
    }

    private evaluateCasterSpell(decision: AIDecision, _entity: CombatEntityInstance, combatState: CombatState): number {
        let score = 50;

        if (!decision.spellId) return score;

        if (AIUtils.isDamageSpell(decision.spellId)) {
            score += 30;
        }

        if (AIUtils.isHealingSpell(decision.spellId) && decision.target) {
            const target = combatState.entities.get(decision.target);
            if (target && AIUtils.isCriticalHealth(target, 0.6)) {
                score += 40;
            }
        }

        return score;
    }

    private evaluateCasterMovement(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = this.evaluateBasicMovement(decision, entity, combatState);

        if (!decision.position) return score;

        const nearbyEnemies = AIUtils.getEnemiesInRange(decision.position, entity, combatState, 2);
        
        if (nearbyEnemies.length === 0) {
            score += 25;
        } else if (nearbyEnemies.length >= 2) {
            score -= 20;
        }

        return score;
    }

    protected calculateExposurePenalty(enemyCount: number): number {
        return enemyCount * 12;
    }
}

// Comportement Support: Heal/buff allies
export class SupportBehavior extends BaseBehavior {
    evaluateAction(decision: AIDecision, entity: CombatEntityInstance, combatState: CombatState): number {
        let score = decision.priority;

        switch (decision.action) {
            case 'cast':
                score += this.evaluateSupportSpell(decision, combatState);
                break;
            case 'move':
                score += this.evaluateBasicMovement(decision, entity, combatState);
                break;
            case 'defend':
                score += 30;
                break;
            case 'attack':
                score += 5;
                break;
            case 'end_turn':
                score = 5;
                break;
        }

        return Math.max(0, score);
    }

    private evaluateSupportSpell(decision: AIDecision, combatState: CombatState): number {
        let score = 40;

        if (AIUtils.isHealingSpell(decision.spellId) && decision.target) {
            const target = combatState.entities.get(decision.target);
            if (target) {
                const healthPercent = AIUtils.getHealthPercentage(target);
                if (healthPercent < 0.3) {
                    score += 60;
                } else if (healthPercent < 0.6) {
                    score += 35;
                }
            }
        }

        return score;
    }

    protected calculateExposurePenalty(enemyCount: number): number {
        return enemyCount * 12;
    }
}