import type { Companion, CompanionEquipmentSlots } from '../types/Companion';
import type { InventoryItem, Item, EquipmentSlot } from '../types/Item';
import type { EquipmentStats } from './EquipmentManager';

/**
 * Gestionnaire d'équipement spécialisé pour les compagnons
 * Système standalone pour gérer l'équipement des compagnons
 */
export class CompanionEquipmentManager {
    private companion: Companion;
    private equippedItems: CompanionEquipmentSlots = {};

    constructor(companion: Companion) {
        this.companion = companion;
        this.loadFromCompanion();
    }

    // Charger l'équipement actuel du compagnon
    private loadFromCompanion(): void {
        this.equippedItems = { ...this.companion.equipped };
    }

    // Sauvegarder l'équipement dans le compagnon
    private saveToCompanion(): void {
        this.companion.equipped = { ...this.equippedItems };
    }

    // Équiper un item dans un slot spécifique
    equipItem(item: InventoryItem, slot: keyof CompanionEquipmentSlots): boolean {
        // Vérifications de base
        if (!this.canEquipItem(item, slot)) {
            return false;
        }

        // Vérifier les restrictions spécifiques aux compagnons
        if (!this.meetsCompanionRequirements(item)) {
            return false;
        }

        // Déséquiper l'ancien item si présent
        const oldItem = this.equippedItems[slot];
        if (oldItem) {
            this.unequipItem(slot);
        }

        // Équiper le nouvel item
        this.equippedItems[slot] = item;
        
        // Marquer l'item comme équipé dans l'inventaire
        const inventoryItem = this.companion.inventory.find(invItem => 
            invItem.item.id === item.item.id
        );
        if (inventoryItem) {
            inventoryItem.equipped = true;
            inventoryItem.slot = this.slotToEquipmentSlot(slot);
        }

        // Appliquer les bonus
        this.applyItemBonus(item, true);
        this.saveToCompanion();
        
        console.log(`✅ ${this.companion.name}: ${item.item.name} équipé dans ${slot}`);
        return true;
    }

    // Déséquiper un item d'un slot
    unequipItem(slot: keyof CompanionEquipmentSlots): boolean {
        const item = this.equippedItems[slot];
        if (!item) {
            return false;
        }

        // Retirer les bonus
        this.applyItemBonus(item, false);
        
        // Retirer l'item du slot
        delete this.equippedItems[slot];
        
        // Marquer l'item comme non équipé dans l'inventaire
        const inventoryItem = this.companion.inventory.find(invItem => 
            invItem.item.id === item.item.id
        );
        if (inventoryItem) {
            inventoryItem.equipped = false;
            delete inventoryItem.slot;
        }

        this.saveToCompanion();
        
        console.log(`❌ ${this.companion.name}: ${item.item.name} déséquipé de ${slot}`);
        return true;
    }

    // Vérifier si un item peut être équipé (override pour compagnons)
    canEquipItem(item: InventoryItem, slot: keyof CompanionEquipmentSlots): boolean {
        // Vérifications de base (type d'item, slot compatible, etc.)
        if (!this.isValidSlotForItem(item.item, slot)) {
            console.warn(`⚠️ ${item.item.name} ne peut pas être équipé dans ${slot}`);
            return false;
        }

        // Vérifier les prérequis
        if (!this.meetsCompanionRequirements(item)) {
            return false;
        }

        // Vérifier les restrictions d'armes 2 mains
        if (!this.checkTwoHandedRestrictions(item, slot)) {
            return false;
        }

        // Vérifier que l'item est dans l'inventaire du compagnon
        if (!this.companion.inventory.some(invItem => invItem.item.id === item.item.id)) {
            console.warn(`⚠️ ${item.item.name} n'est pas dans l'inventaire de ${this.companion.name}`);
            return false;
        }

        return true;
    }

    // Vérifier les prérequis spécifiques aux compagnons
    private meetsCompanionRequirements(item: InventoryItem): boolean {
        const requirements = item.item.requirements;
        if (!requirements) return true;

        // Vérifier le niveau
        if (requirements.level && this.companion.level < requirements.level) {
            console.warn(`⚠️ ${this.companion.name}: Niveau requis: ${requirements.level} (actuel: ${this.companion.level})`);
            return false;
        }

        // Vérifier les stats
        if (requirements.strength && this.companion.stats.strength < requirements.strength) {
            console.warn(`⚠️ ${this.companion.name}: Force requise: ${requirements.strength} (actuelle: ${this.companion.stats.strength})`);
            return false;
        }

        if (requirements.dexterity && this.companion.stats.dexterity < requirements.dexterity) {
            console.warn(`⚠️ ${this.companion.name}: Dextérité requise: ${requirements.dexterity} (actuelle: ${this.companion.stats.dexterity})`);
            return false;
        }

        if (requirements.intelligence && this.companion.stats.intelligence < requirements.intelligence) {
            console.warn(`⚠️ ${this.companion.name}: Intelligence requise: ${requirements.intelligence} (actuelle: ${this.companion.stats.intelligence})`);
            return false;
        }

        // TODO: Vérifier les classes autorisées si applicable
        // if (requirements.class && !requirements.class.includes(this.companion.class)) { ... }

        return true;
    }

    // Vérifier si un item peut aller dans un slot donné
    private isValidSlotForItem(item: Item, slot: keyof CompanionEquipmentSlots): boolean {
        switch (item.type) {
            case 'weapon':
                const weaponItem = item as any; // WeaponItem
                if (weaponItem.twoHanded) {
                    return slot === 'mainHand';
                }
                return slot === 'mainHand' || slot === 'offHand';
            
            case 'armor':
                const armorItem = item as any; // ArmorItem
                switch (armorItem.slot) {
                    case 'head': return slot === 'head';
                    case 'chest': return slot === 'chest';
                    case 'legs': return slot === 'legs';
                    case 'feet': return slot === 'feet';
                    case 'hands': return slot === 'hands';
                    case 'ring': return slot === 'ring';
                    case 'neck': return slot === 'neck';
                    case 'offHand': return slot === 'offHand'; // Shields
                    default: return false;
                }
            
            default:
                return false;
        }
    }

    // Vérifier les restrictions d'armes 2 mains
    private checkTwoHandedRestrictions(item: InventoryItem, slot: keyof CompanionEquipmentSlots): boolean {
        const isTwoHanded = this.isTwoHandedWeapon(item);
        
        if (isTwoHanded && slot === 'mainHand') {
            if (this.equippedItems.offHand) {
                console.warn(`⚠️ Impossible d'équiper ${item.item.name}: arme 2 mains nécessite les deux mains`);
                return false;
            }
        }

        if (slot === 'offHand') {
            const mainHandItem = this.equippedItems.mainHand;
            if (mainHandItem && this.isTwoHandedWeapon(mainHandItem)) {
                console.warn(`⚠️ Impossible d'équiper ${item.item.name}: ${mainHandItem.item.name} occupe les deux mains`);
                return false;
            }
        }

        return true;
    }

    // Détecter si une arme est 2 mains
    private isTwoHandedWeapon(item: InventoryItem): boolean {
        if (item.item.type === 'weapon') {
            const weaponItem = item.item as any; // WeaponItem
            return weaponItem.twoHanded || false;
        }
        return false;
    }

    // Convertir slot companion vers EquipmentSlot
    private slotToEquipmentSlot(slot: keyof CompanionEquipmentSlots): EquipmentSlot {
        const slotMap: Record<keyof CompanionEquipmentSlots, EquipmentSlot> = {
            mainHand: 'mainHand',
            offHand: 'offHand',
            head: 'head',
            chest: 'chest',
            legs: 'legs',
            feet: 'feet',
            hands: 'hands',
            ring: 'ring',
            neck: 'neck'
        };
        return slotMap[slot] || 'mainHand';
    }

    // Appliquer/retirer les bonus d'un item sur le compagnon
    private applyItemBonus(item: InventoryItem, apply: boolean): void {
        // TODO: Appliquer les bonus sur les stats du compagnon
        // Pour l'instant on log juste les changements
        console.log(`📊 ${this.companion.name}: Bonus ${apply ? 'appliqués' : 'retirés'} de ${item.item.name}`);
    }

    // Calculer les statistiques totales de l'équipement
    getTotalStats(): EquipmentStats {
        const stats: EquipmentStats = {
            attack: 0,
            defense: 0,
            health: 0,
            mana: 0,
            movement: 0,
            initiative: 0
        };

        Object.values(this.equippedItems).forEach(item => {
            if (item?.item) {
                // TODO: Extraire les stats de l'item et les ajouter
                // Pour l'instant on simule des bonus basiques
                if (item.item.type === 'weapon') {
                    stats.attack += 2;
                }
                if (item.item.type === 'armor') {
                    stats.defense += 1;
                }
            }
        });

        return stats;
    }

    // Obtenir l'équipement actuel
    getEquippedItems(): CompanionEquipmentSlots {
        return { ...this.equippedItems };
    }

    // Obtenir un item équipé spécifique
    getEquippedItem(slot: keyof CompanionEquipmentSlots): InventoryItem | undefined {
        return this.equippedItems[slot];
    }

    // Auto-équiper le meilleur équipement disponible
    autoEquipBest(): void {
        console.log(`🤖 Auto-équipement de ${this.companion.name}...`);

        // Trier les items par qualité
        const availableItems = this.companion.inventory
            .filter(item => !item.equipped)
            .sort((a, b) => {
                const rarityWeight = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                const aWeight = (rarityWeight as any)[a.item.rarity] * 1000 + a.item.value;
                const bWeight = (rarityWeight as any)[b.item.rarity] * 1000 + b.item.value;
                return bWeight - aWeight;
            });

        // Essayer d'équiper chaque item dans le meilleur slot possible
        availableItems.forEach(item => {
            const possibleSlots = this.getPossibleSlotsForItem(item);
            
            for (const slot of possibleSlots) {
                if (this.canEquipItem(item, slot)) {
                    const currentItem = this.equippedItems[slot];
                    
                    // Équiper si le slot est libre ou si le nouvel item est meilleur
                    if (!currentItem || this.isItemBetter(item, currentItem)) {
                        this.equipItem(item, slot);
                        break;
                    }
                }
            }
        });

        console.log(`✅ Auto-équipement de ${this.companion.name} terminé`);
    }

    // Obtenir les slots possibles pour un item
    private getPossibleSlotsForItem(item: InventoryItem): (keyof CompanionEquipmentSlots)[] {
        const slots: (keyof CompanionEquipmentSlots)[] = [];
        
        switch (item.item.type) {
            case 'weapon':
                const weaponItem = item.item as any; // WeaponItem
                slots.push('mainHand');
                if (!weaponItem.twoHanded) {
                    slots.push('offHand');
                }
                break;
            
            case 'armor':
                const armorItem = item.item as any; // ArmorItem
                switch (armorItem.slot) {
                    case 'head': slots.push('head'); break;
                    case 'chest': slots.push('chest'); break;
                    case 'legs': slots.push('legs'); break;
                    case 'feet': slots.push('feet'); break;
                    case 'hands': slots.push('hands'); break;
                    case 'ring': slots.push('ring'); break;
                    case 'neck': slots.push('neck'); break;
                    case 'offHand': slots.push('offHand'); break;
                }
                break;
        }
        
        return slots;
    }

    // Comparer deux items pour déterminer lequel est meilleur
    private isItemBetter(newItem: InventoryItem, currentItem: InventoryItem): boolean {
        const rarityWeight = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        const newScore = (rarityWeight as any)[newItem.item.rarity] * 1000 + newItem.item.value;
        const currentScore = (rarityWeight as any)[currentItem.item.rarity] * 1000 + currentItem.item.value;
        return newScore > currentScore;
    }

    // Obtenir un résumé de l'équipement
    getEquipmentSummary(): string {
        const equipped = Object.entries(this.equippedItems).filter(([, item]) => item);
        if (equipped.length === 0) {
            return `${this.companion.name}: Aucun équipement`;
        }

        const summary = equipped.map(([slot, item]) => {
            return `${slot}: ${item!.item.name}`;
        }).join(', ');

        const stats = this.getTotalStats();
        const statsStr = Object.entries(stats)
            .filter(([, value]) => value > 0)
            .map(([stat, value]) => `${stat}: +${value}`)
            .join(', ');

        return `${this.companion.name}: ${summary} | Bonus: ${statsStr}`;
    }
}

export default CompanionEquipmentManager;