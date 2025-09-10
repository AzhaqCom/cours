import type { Companion, CompanionProgressionPath } from '../types/Companion';
import type { CombatEntityInstance } from '../types/CombatEntity';
import type { CompanionInventoryItem } from '../types/Companion';

// Configuration du système de compagnons
export interface CompanionConfig {
    maxCompanions: number;
    baseXpPerLevel: number;
    xpGrowthRate: number; // Multiplicateur par niveau
    maxLevel: number;
    startingInventorySize: number;
}

// Configuration par défaut
export const DEFAULT_COMPANION_CONFIG: CompanionConfig = {
    maxCompanions: 4,
    baseXpPerLevel: 100,
    xpGrowthRate: 1.5,
    maxLevel: 20,
    startingInventorySize: 10
};

// Résultat d'une opération sur les compagnons
export interface CompanionOperationResult {
    success: boolean;
    message: string;
    companion?: Companion;
}

// Gestionnaire principal du système de compagnons
export class CompanionManager {
    private companions: Map<string, Companion> = new Map();
    private config: CompanionConfig;

    constructor(config: CompanionConfig = DEFAULT_COMPANION_CONFIG) {
        this.config = config;
    }

    // Obtenir tous les compagnons
    getAllCompanions(): Companion[] {
        return Array.from(this.companions.values());
    }

    // Obtenir un compagnon par ID
    getCompanion(id: string): Companion | undefined {
        return this.companions.get(id);
    }

    // Obtenir les compagnons vivants
    getAliveCompanions(): Companion[] {
        return this.getAllCompanions().filter(companion => 
            this.isCompanionAlive(companion)
        );
    }

    // Obtenir le nombre de compagnons actuels
    getCompanionCount(): number {
        return this.companions.size;
    }

    // Vérifier si on peut ajouter un compagnon
    canAddCompanion(): boolean {
        return this.getCompanionCount() < this.config.maxCompanions;
    }

    // Ajouter un nouveau compagnon (via consequences)
    addCompanion(companionData: Omit<Companion, 'xp' | 'inventory' | 'equipped'>): CompanionOperationResult {
        // Vérifier la limite
        if (!this.canAddCompanion()) {
            return {
                success: false,
                message: `Limite de ${this.config.maxCompanions} compagnons atteinte`
            };
        }

        // Vérifier que l'ID est unique
        if (this.companions.has(companionData.id)) {
            return {
                success: false,
                message: `Un compagnon avec l'ID ${companionData.id} existe déjà`
            };
        }

        // Valider les données
        const validation = this.validateCompanionData(companionData);
        if (!validation.success) {
            return validation;
        }

        // Créer le compagnon complet avec valeurs par défaut
        const companion: Companion = {
            ...companionData,
            xp: 0,
            inventory: [],
            equipped: {
                mainHand: undefined,
                offHand: undefined,
                armor: undefined,
                accessory: undefined
            }
        };

        // Ajouter à la collection
        this.companions.set(companion.id, companion);

        return {
            success: true,
            message: `${companion.name} a rejoint votre groupe !`,
            companion
        };
    }

    // Supprimer un compagnon (rare, via story consequences)
    removeCompanion(id: string): CompanionOperationResult {
        const companion = this.companions.get(id);
        
        if (!companion) {
            return {
                success: false,
                message: 'Compagnon non trouvé'
            };
        }

        // Récupérer tous les objets équipés et inventaire
        const recoveredItems = this.unequipAllItems(companion);
        this.companions.delete(id);

        return {
            success: true,
            message: `${companion.name} a quitté le groupe. ${recoveredItems.length} objets récupérés.`,
            companion
        };
    }

    // Gestion de l'inventaire
    addItemToCompanion(companionId: string, item: CompanionInventoryItem): CompanionOperationResult {
        const companion = this.companions.get(companionId);
        if (!companion) {
            return { success: false, message: 'Compagnon non trouvé' };
        }

        // Vérifier l'espace dans l'inventaire
        if (companion.inventory.length >= this.config.startingInventorySize) {
            return { 
                success: false, 
                message: `Inventaire de ${companion.name} plein` 
            };
        }

        companion.inventory.push(item);

        return {
            success: true,
            message: `${item.itemId} ajouté à l'inventaire de ${companion.name}`,
            companion
        };
    }

    // Équiper un objet
    equipItem(companionId: string, itemId: string, slot: keyof Companion['equipped']): CompanionOperationResult {
        const companion = this.companions.get(companionId);
        if (!companion) {
            return { success: false, message: 'Compagnon non trouvé' };
        }

        // Trouver l'objet dans l'inventaire
        const itemIndex = companion.inventory.findIndex(item => item.itemId === itemId);
        if (itemIndex === -1) {
            return { 
                success: false, 
                message: `${companion.name} ne possède pas cet objet` 
            };
        }

        const item = companion.inventory[itemIndex];

        // Vérifier que l'objet peut être équipé dans ce slot
        if (!this.canEquipInSlot(item, slot)) {
            return {
                success: false,
                message: `Objet ne peut pas être équipé dans ${slot}`
            };
        }

        // Déséquiper l'objet actuel s'il y en a un
        if (companion.equipped[slot]) {
            this.unequipItem(companionId, slot);
        }

        // Équiper le nouvel objet
        companion.equipped[slot] = itemId;
        
        // Retirer de l'inventaire
        companion.inventory.splice(itemIndex, 1);

        return {
            success: true,
            message: `${item.itemId} équipé sur ${companion.name}`,
            companion
        };
    }

    // Déséquiper un objet
    unequipItem(companionId: string, slot: keyof Companion['equipped']): CompanionOperationResult {
        const companion = this.companions.get(companionId);
        if (!companion) {
            return { success: false, message: 'Compagnon non trouvé' };
        }

        const equippedItemId = companion.equipped[slot];
        if (!equippedItemId) {
            return {
                success: false,
                message: `Aucun objet équipé dans ${slot}`
            };
        }

        // Vérifier l'espace dans l'inventaire
        if (companion.inventory.length >= this.config.startingInventorySize) {
            return {
                success: false,
                message: 'Inventaire plein, impossible de déséquiper'
            };
        }

        // TODO: Récupérer les données de l'objet depuis la base de données
        // Pour le moment, on crée un objet basique
        const item: CompanionInventoryItem = {
            itemId: equippedItemId,
            quantity: 1,
            equipped: false
        };

        // Déséquiper et remettre dans l'inventaire
        companion.equipped[slot] = undefined;
        companion.inventory.push(item);

        return {
            success: true,
            message: `Objet déséquipé de ${companion.name}`,
            companion
        };
    }

    // Conversion d'un compagnon en instance de combat
    createCombatInstance(companionId: string, instanceId: string): CombatEntityInstance | null {
        const companion = this.companions.get(companionId);
        if (!companion) return null;

        return {
            instanceId,
            entity: companion,
            currentHp: companion.maxHp,
            position: { x: 0, y: 0 }, // Position sera définie dans le combat
            isAlive: true,
            initiative: 0, // Initiative sera calculée au début du combat
            hasActed: false,
            hasMoved: false
        };
    }

    // Mettre à jour un compagnon après combat
    updateFromCombatInstance(instance: CombatEntityInstance): CompanionOperationResult {
        const companion = this.companions.get(instance.entity.id);
        if (!companion) {
            return { success: false, message: 'Compagnon non trouvé' };
        }

        // Mettre à jour les HP (ne peut pas dépasser le max)
        // const newHp = Math.min(instance.currentHp, companion.maxHp);
        
        // Si le compagnon est mort, on le considère comme inconscient (HP = 0)
        if (!instance.isAlive) {
            // Les compagnons ne meurent pas définitivement, ils sont K.O.
            return {
                success: true,
                message: `${companion.name} est inconscient et nécessite des soins`,
                companion
            };
        }

        return {
            success: true,
            message: `État de ${companion.name} mis à jour`,
            companion
        };
    }

    // Soigner un compagnon
    healCompanion(companionId: string, amount: number): CompanionOperationResult {
        const companion = this.companions.get(companionId);
        if (!companion) {
            return { success: false, message: 'Compagnon non trouvé' };
        }

        const oldHp = companion.maxHp; // Les compagnons récupèrent toujours max HP hors combat
        const actualHealing = Math.min(amount, companion.maxHp - oldHp);

        if (actualHealing <= 0) {
            return {
                success: false,
                message: `${companion.name} est déjà en pleine forme`
            };
        }

        return {
            success: true,
            message: `${companion.name} récupère ${actualHealing} HP`,
            companion
        };
    }

    // Méthodes privées utilitaires
    private validateCompanionData(data: Omit<Companion, 'xp' | 'inventory' | 'equipped'>): CompanionOperationResult {
        // Validation des champs requis
        if (!data.id || !data.name) {
            return { success: false, message: 'ID et nom requis' };
        }

        // Validation des stats
        if (data.maxHp <= 0 || data.ac < 0 || data.movement <= 0) {
            return { success: false, message: 'Stats invalides' };
        }

        // Validation du niveau
        if (data.level < 1 || data.level > this.config.maxLevel) {
            return { 
                success: false, 
                message: `Niveau doit être entre 1 et ${this.config.maxLevel}` 
            };
        }

        // Validation du progression path
        const validPaths: CompanionProgressionPath[] = ['warrior', 'mage', 'support'];
        if (!validPaths.includes(data.progressionPath)) {
            return { 
                success: false, 
                message: `Progression path invalide: ${data.progressionPath}` 
            };
        }

        return { success: true, message: 'Données valides' };
    }

    private canEquipInSlot(item: CompanionInventoryItem, slot: keyof Companion['equipped']): boolean {
        // TODO: Intégrer avec la vraie base de données des objets
        // Pour le moment, toujours true (validation plus tard)
        return slot && item && true;
    }

    // private getItemTypeFromSlot(slot: keyof Companion['equipped']): string {
    //     switch (slot) {
    //         case 'mainHand':
    //         case 'offHand':
    //             return 'weapon';
    //         case 'armor':
    //             return 'armor';
    //         case 'accessory':
    //             return 'accessory';
    //         default:
    //             return 'misc';
    //     }
    // }

    private unequipAllItems(companion: Companion): CompanionInventoryItem[] {
        const items: CompanionInventoryItem[] = [];
        
        // Déséquiper tous les slots
        Object.keys(companion.equipped).forEach(slot => {
            const key = slot as keyof Companion['equipped'];
            if (companion.equipped[key]) {
                const item: CompanionInventoryItem = {
                    itemId: companion.equipped[key]!,
                    quantity: 1,
                    equipped: false
                };
                items.push(item);
                companion.equipped[key] = undefined;
            }
        });

        return items;
    }

    private isCompanionAlive(_companion: Companion): boolean {
        // Les compagnons sont toujours "vivants" hors combat
        // Ils peuvent être inconscients mais se remettent
        return true;
    }
}