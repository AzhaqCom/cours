
// Position sur la grille
export interface Position {
    x: number;
    y: number;
}

// Taille de la grille
export interface GridSize {
    width: number;
    height: number;
}

// Classe pour gérer la grille de combat
export class CombatGrid {
    width: number;
    height: number;
    entities: Map<string, Position>; // instanceId -> position

    constructor(size: GridSize) {
        this.width = size.width;
        this.height = size.height;
        this.entities = new Map();
    }

    // Placer une entité sur la grille
    placeEntity(instanceId: string, position: Position): boolean {
        if (!this.isValidPosition(position)) {
            return false;
        }

        if (this.isOccupied(position)) {
            return false;
        }

        this.entities.set(instanceId, position);
        return true;
    }

    // Déplacer une entité
    moveEntity(instanceId: string, to: Position): boolean {
        if (!this.isValidPosition(to)) {
            return false;
        }

        if (this.isOccupied(to)) {
            return false;
        }

        this.entities.set(instanceId, to);
        return true;
    }

    // Supprimer une entité de la grille
    removeEntity(instanceId: string): void {
        this.entities.delete(instanceId);
    }

    // Obtenir la position d'une entité
    getEntityPosition(instanceId: string): Position | undefined {
        return this.entities.get(instanceId);
    }

    // Vérifier si une position est valide
    isValidPosition(position: Position): boolean {
        return position.x >= 0 && 
               position.x < this.width && 
               position.y >= 0 && 
               position.y < this.height;
    }

    // Vérifier si une position est occupée
    isOccupied(position: Position): boolean {
        for (const entityPos of this.entities.values()) {
            if (entityPos.x === position.x && entityPos.y === position.y) {
                return true;
            }
        }
        return false;
    }

    // Calculer la distance entre deux positions (Manhattan)
    getDistance(from: Position, to: Position): number {
        return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
    }

    // Calculer la distance euclidienne
    getEuclideanDistance(from: Position, to: Position): number {
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Obtenir toutes les entités dans une portée donnée
    getEntitiesInRange(from: Position, range: number): string[] {
        const entitiesInRange: string[] = [];

        for (const [instanceId, position] of this.entities.entries()) {
            if (this.getDistance(from, position) <= range) {
                entitiesInRange.push(instanceId);
            }
        }

        return entitiesInRange;
    }

    // Vérifier si un mouvement est valide (distance)
    isValidMove(from: Position, to: Position, movement: number): boolean {
        if (!this.isValidPosition(to)) {
            return false;
        }

        if (this.isOccupied(to)) {
            return false;
        }

        return this.getDistance(from, to) <= movement;
    }

    // Obtenir toutes les positions accessibles depuis une position
    getAccessiblePositions(from: Position, movement: number): Position[] {
        const accessible: Position[] = [];

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const pos = { x, y };
                if (this.isValidMove(from, pos, movement)) {
                    accessible.push(pos);
                }
            }
        }

        return accessible;
    }

    // Obtenir l'ID de l'entité à une position donnée
    getEntityAtPosition(position: Position): string | undefined {
        for (const [instanceId, entityPos] of this.entities.entries()) {
            if (entityPos.x === position.x && entityPos.y === position.y) {
                return instanceId;
            }
        }
        return undefined;
    }

    // Effacer la grille
    clear(): void {
        this.entities.clear();
    }

    // Obtenir toutes les positions occupées
    getOccupiedPositions(): Position[] {
        return Array.from(this.entities.values());
    }

    // Vérifier si deux positions sont adjacentes
    areAdjacent(pos1: Position, pos2: Position): boolean {
        return this.getDistance(pos1, pos2) === 1;
    }
}