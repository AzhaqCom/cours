import { CombatGrid, type Position } from './Grid';
import { InitiativeTracker } from './Initiative';
import type { CombatEntityInstance } from '../../types/CombatEntity';
import type { CombatScene } from '../../types/Scene';

// État du combat
export interface CombatState {
    isActive: boolean;
    grid: CombatGrid;
    initiative: InitiativeTracker;
    entities: Map<string, CombatEntityInstance>; // instanceId -> entity
    playerEntities: string[]; // IDs des entités contrôlées par le joueur
    enemyEntities: string[]; // IDs des entités ennemies
    companionEntities: string[]; // IDs des compagnons
    currentPhase: 'setup' | 'combat' | 'victory' | 'defeat';
}

// Résultat d'une action de combat
export interface CombatActionResult {
    success: boolean;
    message?: string;
    damage?: number;
    healing?: number;
    effects?: string[];
}

// Manager principal du système de combat
export class CombatManager {
    private combatState: CombatState;

    constructor() {
        this.combatState = {
            isActive: false,
            grid: new CombatGrid({ width: 8, height: 6 }),
            initiative: new InitiativeTracker(),
            entities: new Map(),
            playerEntities: [],
            enemyEntities: [],
            companionEntities: [],
            currentPhase: 'setup'
        };
    }

    // Initialiser un combat depuis une scène
    initializeCombat(scene: CombatScene, playerEntity: CombatEntityInstance, companions: CombatEntityInstance[], enemies: CombatEntityInstance[]): boolean {
        try {
            // Réinitialiser l'état
            this.resetCombat();

            // Configurer la grille
            this.combatState.grid = new CombatGrid(scene.combat.gridSize);

            // Ajouter toutes les entités
            const allEntities = [playerEntity, ...companions, ...enemies];
            let positionIndex = 0;

            allEntities.forEach((entity, index) => {
                // Générer un ID unique pour cette instance
                entity.instanceId = `${entity.entity.id}_${Date.now()}_${index}`;
                
                // Stocker l'entité
                this.combatState.entities.set(entity.instanceId, entity);

                // Placer sur la grille
                if (positionIndex < scene.combat.initialPositions.length) {
                    const position = scene.combat.initialPositions[positionIndex];
                    this.combatState.grid.placeEntity(entity.instanceId, position);
                    entity.position = position;
                    positionIndex++;
                }

                // Classer l'entité
                if (entity === playerEntity) {
                    this.combatState.playerEntities.push(entity.instanceId);
                } else if (companions.includes(entity)) {
                    this.combatState.companionEntities.push(entity.instanceId);
                } else {
                    this.combatState.enemyEntities.push(entity.instanceId);
                }
            });

            // Lancer l'initiative
            this.combatState.initiative.rollInitiative(allEntities);

            this.combatState.isActive = true;
            this.combatState.currentPhase = 'combat';

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du combat:', error);
            return false;
        }
    }

    // Obtenir l'état actuel du combat
    getCombatState(): CombatState {
        return { ...this.combatState };
    }

    // Obtenir l'entité qui joue actuellement
    getCurrentEntity(): CombatEntityInstance | undefined {
        const current = this.combatState.initiative.getCurrentTurn();
        if (!current) return undefined;
        return this.combatState.entities.get(current.instanceId);
    }

    // Vérifier si c'est le tour du joueur
    isPlayerTurn(): boolean {
        const current = this.getCurrentEntity();
        if (!current) return false;
        return this.combatState.playerEntities.includes(current.instanceId);
    }

    // Passer au tour suivant
    nextTurn(): void {
        this.combatState.initiative.nextTurn();
        this.checkCombatEnd();
    }

    // Appliquer des dégâts à une entité
    applyDamage(targetId: string, damage: number): CombatActionResult {
        const target = this.combatState.entities.get(targetId);
        if (!target) {
            return { success: false, message: 'Cible non trouvée' };
        }

        if (!target.isAlive) {
            return { success: false, message: 'La cible est déjà morte' };
        }

        // Appliquer les dégâts
        const actualDamage = Math.max(0, damage);
        target.currentHp = Math.max(0, target.currentHp - actualDamage);

        // Vérifier si l'entité meurt
        if (target.currentHp <= 0) {
            target.isAlive = false;
            this.combatState.grid.removeEntity(targetId);
            this.combatState.initiative.removeEntity(targetId);
        }

        return {
            success: true,
            damage: actualDamage,
            message: `${target.entity.name} subit ${actualDamage} dégâts`
        };
    }

    // Appliquer des soins à une entité
    applyHealing(targetId: string, healing: number): CombatActionResult {
        const target = this.combatState.entities.get(targetId);
        if (!target) {
            return { success: false, message: 'Cible non trouvée' };
        }

        if (!target.isAlive) {
            return { success: false, message: 'Impossible de soigner une entité morte' };
        }

        // Appliquer les soins (ne peut pas dépasser HP max)
        const actualHealing = Math.min(healing, target.entity.maxHp - target.currentHp);
        target.currentHp = Math.min(target.entity.maxHp, target.currentHp + actualHealing);

        return {
            success: true,
            healing: actualHealing,
            message: `${target.entity.name} récupère ${actualHealing} HP`
        };
    }

    // Déplacer une entité
    moveEntity(instanceId: string, newPosition: Position): CombatActionResult {
        const entity = this.combatState.entities.get(instanceId);
        if (!entity) {
            return { success: false, message: 'Entité non trouvée' };
        }

        if (!entity.isAlive) {
            return { success: false, message: 'Les entités mortes ne peuvent pas bouger' };
        }

        if (entity.hasMoved) {
            return { success: false, message: 'Cette entité a déjà bougé ce tour' };
        }

        // Vérifier si le mouvement est valide
        const currentPos = this.combatState.grid.getEntityPosition(instanceId);
        if (!currentPos) {
            return { success: false, message: 'Position actuelle non trouvée' };
        }

        if (!this.combatState.grid.isValidMove(currentPos, newPosition, entity.entity.movement)) {
            return { success: false, message: 'Mouvement invalide ou trop loin' };
        }

        // Effectuer le mouvement
        if (this.combatState.grid.moveEntity(instanceId, newPosition)) {
            entity.position = newPosition;
            entity.hasMoved = true;
            return { success: true, message: `${entity.entity.name} se déplace` };
        }

        return { success: false, message: 'Impossible de se déplacer à cette position' };
    }

    // Vérifier les conditions de fin de combat
    private checkCombatEnd(): void {
        const aliveEnemies = this.combatState.enemyEntities.filter(id => {
            const entity = this.combatState.entities.get(id);
            return entity?.isAlive;
        });

        const aliveAllies = [...this.combatState.playerEntities, ...this.combatState.companionEntities]
            .filter(id => {
                const entity = this.combatState.entities.get(id);
                return entity?.isAlive;
            });

        if (aliveEnemies.length === 0) {
            this.combatState.currentPhase = 'victory';
            this.combatState.isActive = false;
        } else if (aliveAllies.length === 0) {
            this.combatState.currentPhase = 'defeat';
            this.combatState.isActive = false;
        }
    }

    // Obtenir toutes les entités vivantes
    getAliveEntities(): CombatEntityInstance[] {
        return Array.from(this.combatState.entities.values()).filter(entity => entity.isAlive);
    }

    // Obtenir les entités dans une portée donnée
    getEntitiesInRange(fromId: string, range: number): CombatEntityInstance[] {
        const fromPos = this.combatState.grid.getEntityPosition(fromId);
        if (!fromPos) return [];

        const entitiesInRange = this.combatState.grid.getEntitiesInRange(fromPos, range);
        return entitiesInRange
            .map(id => this.combatState.entities.get(id))
            .filter((entity): entity is CombatEntityInstance => entity !== undefined && entity.isAlive);
    }

    // Réinitialiser le combat
    resetCombat(): void {
        this.combatState.isActive = false;
        this.combatState.grid.clear();
        this.combatState.initiative.reset();
        this.combatState.entities.clear();
        this.combatState.playerEntities = [];
        this.combatState.enemyEntities = [];
        this.combatState.companionEntities = [];
        this.combatState.currentPhase = 'setup';
    }

    // Obtenir le résultat du combat (pour les récompenses)
    getCombatResult(): 'victory' | 'defeat' | 'ongoing' {
        if (this.combatState.currentPhase === 'victory') return 'victory';
        if (this.combatState.currentPhase === 'defeat') return 'defeat';
        return 'ongoing';
    }
}