import type { CombatEntityInstance } from '../../types/CombatEntity';
import type { CombatState } from '../combat/CombatManager';
import type { Position } from '../combat/Grid';

// Utilitaires communs pour le système d'IA
export class AIUtils {
    
    // Obtenir les entités ennemies d'une entité donnée
    static getEnemyEntities(entity: CombatEntityInstance, combatState: CombatState): CombatEntityInstance[] {
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

    // Obtenir les entités alliées d'une entité donnée
    static getAllyEntities(entity: CombatEntityInstance, combatState: CombatState): CombatEntityInstance[] {
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

    // Obtenir les ennemis dans une portée donnée autour d'une position
    static getEnemiesInRange(
        position: Position, 
        entity: CombatEntityInstance, 
        combatState: CombatState, 
        range: number
    ): CombatEntityInstance[] {
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

    // Obtenir les alliés dans une portée donnée autour d'une position
    static getAlliesInRange(
        position: Position, 
        entity: CombatEntityInstance, 
        combatState: CombatState, 
        range: number
    ): CombatEntityInstance[] {
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

    // Calculer la distance entre deux entités
    static getDistanceBetweenEntities(
        entity1: CombatEntityInstance, 
        entity2: CombatEntityInstance, 
        combatState: CombatState
    ): number {
        const pos1 = combatState.grid.getEntityPosition(entity1.instanceId);
        const pos2 = combatState.grid.getEntityPosition(entity2.instanceId);

        if (!pos1 || !pos2) return 999; // Distance infinie si position non trouvée

        return combatState.grid.getDistance(pos1, pos2);
    }

    // Vérifier si une entité est dans un état critique
    static isCriticalHealth(entity: CombatEntityInstance, threshold: number = 0.3): boolean {
        return (entity.currentHp / entity.entity.maxHp) < threshold;
    }

    // Vérifier si une entité est blessée
    static isWounded(entity: CombatEntityInstance, threshold: number = 0.6): boolean {
        return (entity.currentHp / entity.entity.maxHp) < threshold;
    }

    // Obtenir le pourcentage de santé d'une entité
    static getHealthPercentage(entity: CombatEntityInstance): number {
        return entity.currentHp / entity.entity.maxHp;
    }

    // Vérifier si un sort est probablement un sort de dégâts
    static isDamageSpell(spellId?: string): boolean {
        if (!spellId) return false;
        
        const damageKeywords = ['damage', 'bolt', 'missile', 'fire', 'ice', 'lightning', 'burn', 'freeze', 'shock', 'blast'];
        return damageKeywords.some(keyword => spellId.toLowerCase().includes(keyword));
    }

    // Vérifier si un sort est probablement un sort de soin
    static isHealingSpell(spellId?: string): boolean {
        if (!spellId) return false;
        
        const healingKeywords = ['heal', 'cure', 'restore', 'regenerate', 'mend', 'recovery'];
        return healingKeywords.some(keyword => spellId.toLowerCase().includes(keyword));
    }

    // Vérifier si une arme est probablement à distance
    static isRangedWeapon(weaponId?: string): boolean {
        if (!weaponId) return false;
        
        const rangedKeywords = ['bow', 'crossbow', 'sling', 'dart', 'javelin', 'thrown'];
        return rangedKeywords.some(keyword => weaponId.toLowerCase().includes(keyword));
    }

    // Obtenir la position optimale pour un rôle donné par rapport à une cible
    static getOptimalRange(role: string): { min: number; max: number } {
        switch (role) {
            case 'archer':
                return { min: 3, max: 6 };
            case 'caster':
                return { min: 2, max: 5 };
            case 'tank':
            case 'skirmisher':
                return { min: 1, max: 2 };
            default:
                return { min: 1, max: 3 };
        }
    }

    // Évaluer si une distance est optimale pour un rôle
    static isOptimalRange(distance: number, role: string): boolean {
        const range = this.getOptimalRange(role);
        return distance >= range.min && distance <= range.max;
    }

    // Trouver l'ennemi le plus proche
    static getClosestEnemy(entity: CombatEntityInstance, combatState: CombatState): CombatEntityInstance | null {
        const enemies = this.getEnemyEntities(entity, combatState);
        if (enemies.length === 0) return null;

        let closest = enemies[0];
        let closestDistance = this.getDistanceBetweenEntities(entity, closest, combatState);

        for (let i = 1; i < enemies.length; i++) {
            const distance = this.getDistanceBetweenEntities(entity, enemies[i], combatState);
            if (distance < closestDistance) {
                closest = enemies[i];
                closestDistance = distance;
            }
        }

        return closest;
    }

    // Trouver l'allié le plus blessé à portée
    static getMostWoundedAllyInRange(
        entity: CombatEntityInstance, 
        combatState: CombatState, 
        range: number
    ): CombatEntityInstance | null {
        const entityPos = combatState.grid.getEntityPosition(entity.instanceId);
        if (!entityPos) return null;

        const allies = this.getAlliesInRange(entityPos, entity, combatState, range);
        if (allies.length === 0) return null;

        let mostWounded = allies[0];
        let lowestHealthPercent = this.getHealthPercentage(mostWounded);

        for (let i = 1; i < allies.length; i++) {
            const healthPercent = this.getHealthPercentage(allies[i]);
            if (healthPercent < lowestHealthPercent) {
                mostWounded = allies[i];
                lowestHealthPercent = healthPercent;
            }
        }

        return mostWounded;
    }
}