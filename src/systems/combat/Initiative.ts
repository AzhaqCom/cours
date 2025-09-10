import type { CombatEntityInstance } from '../../types/CombatEntity';

// Entité avec ordre d'initiative
export interface OrderedEntity {
    instanceId: string;
    initiative: number;
    entity: CombatEntityInstance;
}

// Tracker de l'initiative
export class InitiativeTracker {
    private turnOrder: OrderedEntity[];
    private currentTurnIndex: number;
    private round: number;

    constructor() {
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.round = 1;
    }

    // Lancer l'initiative pour toutes les entités
    rollInitiative(entities: CombatEntityInstance[]): OrderedEntity[] {
        this.turnOrder = entities.map(entity => {
            // Jet d'initiative: 1d20 + modificateur DEX
            const dexModifier = Math.floor((entity.entity.stats.dexterity - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            const initiative = roll + dexModifier;

            // Stocker l'initiative dans l'instance
            entity.initiative = initiative;

            return {
                instanceId: entity.instanceId,
                initiative,
                entity
            };
        });

        // Trier par initiative décroissante (plus haut en premier)
        this.turnOrder.sort((a, b) => {
            // En cas d'égalité, celui avec la plus haute DEX joue en premier
            if (a.initiative === b.initiative) {
                return b.entity.entity.stats.dexterity - a.entity.entity.stats.dexterity;
            }
            return b.initiative - a.initiative;
        });

        // Remettre l'index au début
        this.currentTurnIndex = 0;
        this.round = 1;

        return this.turnOrder;
    }

    // Obtenir l'entité qui joue actuellement
    getCurrentTurn(): OrderedEntity | undefined {
        if (this.turnOrder.length === 0) {
            return undefined;
        }
        return this.turnOrder[this.currentTurnIndex];
    }

    // Passer au tour suivant
    nextTurn(): OrderedEntity | undefined {
        if (this.turnOrder.length === 0) {
            return undefined;
        }

        // Marquer l'entité actuelle comme ayant agi
        const currentEntity = this.turnOrder[this.currentTurnIndex];
        if (currentEntity) {
            currentEntity.entity.hasActed = true;
        }

        this.currentTurnIndex++;

        // Si on a fait le tour de tous les joueurs
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this.nextRound();
        }

        return this.getCurrentTurn();
    }

    // Passer au round suivant
    private nextRound(): void {
        this.currentTurnIndex = 0;
        this.round++;

        // Remettre tous les flags à false pour le nouveau round
        this.turnOrder.forEach(orderedEntity => {
            orderedEntity.entity.hasActed = false;
            orderedEntity.entity.hasMoved = false;
        });
    }

    // Obtenir le round actuel
    getCurrentRound(): number {
        return this.round;
    }

    // Obtenir l'ordre complet des tours
    getTurnOrder(): OrderedEntity[] {
        return [...this.turnOrder];
    }

    // Vérifier si c'est le tour d'une entité spécifique
    isEntityTurn(instanceId: string): boolean {
        const current = this.getCurrentTurn();
        return current?.instanceId === instanceId;
    }

    // Obtenir la prochaine entité dans l'ordre
    getNextEntity(): OrderedEntity | undefined {
        if (this.turnOrder.length === 0) {
            return undefined;
        }

        const nextIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
        return this.turnOrder[nextIndex];
    }

    // Supprimer une entité de l'ordre d'initiative (si elle meurt)
    removeEntity(instanceId: string): void {
        const index = this.turnOrder.findIndex(e => e.instanceId === instanceId);
        if (index === -1) return;

        // Si on supprime une entité avant l'index actuel, décaler l'index
        if (index < this.currentTurnIndex) {
            this.currentTurnIndex--;
        }
        // Si on supprime l'entité actuelle, ne pas incrémenter l'index au prochain tour
        else if (index === this.currentTurnIndex) {
            // L'index reste le même, mais il pointera vers l'entité suivante
        }

        this.turnOrder.splice(index, 1);

        // Ajuster l'index si on est à la fin de la liste
        if (this.currentTurnIndex >= this.turnOrder.length) {
            this.nextRound();
        }
    }

    // Ajouter une entité en cours de combat (rare, mais possible)
    addEntity(entity: CombatEntityInstance, initiative?: number): void {
        const dexModifier = Math.floor((entity.entity.stats.dexterity - 10) / 2);
        const finalInitiative = initiative ?? (Math.floor(Math.random() * 20) + 1 + dexModifier);
        
        entity.initiative = finalInitiative;

        const orderedEntity: OrderedEntity = {
            instanceId: entity.instanceId,
            initiative: finalInitiative,
            entity
        };

        // Trouver la position correcte dans l'ordre d'initiative
        let insertIndex = this.turnOrder.findIndex(e => e.initiative < finalInitiative);
        if (insertIndex === -1) {
            insertIndex = this.turnOrder.length;
        }

        this.turnOrder.splice(insertIndex, 0, orderedEntity);

        // Ajuster l'index actuel si nécessaire
        if (insertIndex <= this.currentTurnIndex) {
            this.currentTurnIndex++;
        }
    }

    // Réinitialiser le tracker
    reset(): void {
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.round = 1;
    }
}