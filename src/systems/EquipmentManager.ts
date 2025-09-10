import type { Character } from '../types/Character';
import type { InventoryItem, EquipmentSlots } from '../components/inventory/InventoryPanel';

export interface EquipmentStats {
    attack: number;
    defense: number;
    health: number;
    mana: number;
    movement?: number;
    initiative?: number;
}

export interface EquipmentRequirement {
    level?: number;
    class?: string[];
    stats?: Record<string, number>;
}

export class EquipmentManager {
    private equippedItems: EquipmentSlots = {};
    private character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    // Équiper un item dans un slot spécifique
    equipItem(item: InventoryItem, slot: keyof EquipmentSlots): boolean {
        // Vérifier si l'item peut être équipé
        if (!this.canEquipItem(item, slot)) {
            return false;
        }

        // Déséquiper l'ancien item si présent
        const oldItem = this.equippedItems[slot];
        if (oldItem) {
            this.unequipItem(slot);
        }

        // Équiper le nouvel item
        this.equippedItems[slot] = { ...item, equipped: true };
        
        // Appliquer les bonus
        this.applyItemBonus(item, true);
        
        console.log(`✅ ${item.name} équipé dans ${slot}`);
        return true;
    }

    // Déséquiper un item d'un slot
    unequipItem(slot: keyof EquipmentSlots): boolean {
        const item = this.equippedItems[slot];
        if (!item) {
            return false;
        }

        // Retirer les bonus
        this.applyItemBonus(item, false);
        
        // Retirer l'item du slot
        delete this.equippedItems[slot];
        
        console.log(`❌ ${item.name} déséquipé de ${slot}`);
        return true;
    }

    // Vérifier si un item peut être équipé
    canEquipItem(item: InventoryItem, slot: keyof EquipmentSlots): boolean {
        // Vérifier que l'item a un slot d'équipement
        if (!item.equipSlot) {
            console.warn(`⚠️ ${item.name} n'est pas équipable`);
            return false;
        }

        // Vérifier la compatibilité du slot
        if (item.equipSlot !== slot) {
            console.warn(`⚠️ ${item.name} ne peut pas être équipé dans ${slot} (slot requis: ${item.equipSlot})`);
            return false;
        }

        // Vérifier les prérequis
        if (!this.meetsRequirements(item)) {
            return false;
        }

        // Vérifier les restrictions de 2 mains
        if (!this.checkTwoHandedRestrictions(item, slot)) {
            return false;
        }

        return true;
    }

    // Vérifier les prérequis d'un item
    private meetsRequirements(item: InventoryItem): boolean {
        if (!item.requirements) {
            return true;
        }

        const req = item.requirements;

        // Vérifier le niveau
        if (req.level && this.character.level < req.level) {
            console.warn(`⚠️ Niveau requis: ${req.level} (actuel: ${this.character.level})`);
            return false;
        }

        // Vérifier la classe
        if (req.class && !req.class.includes(this.character.class)) {
            console.warn(`⚠️ Classe requise: ${req.class.join(' ou ')} (actuelle: ${this.character.class})`);
            return false;
        }

        // Vérifier les statistiques (TODO: intégrer avec vrai système de stats)
        if (req.stats) {
            for (const [stat, requiredValue] of Object.entries(req.stats)) {
                // Pour l'instant, on assume que le personnage a toutes les stats requises
                // TODO: Intégrer avec système de stats du personnage
                console.log(`🔍 Vérification stat ${stat}: ${requiredValue} requis`);
            }
        }

        return true;
    }

    // Vérifier les restrictions d'armes 2 mains
    private checkTwoHandedRestrictions(item: InventoryItem, slot: keyof EquipmentSlots): boolean {
        const isTwoHanded = this.isTwoHandedWeapon(item);
        
        if (isTwoHanded && slot === 'mainHand') {
            // Si on équipe une arme 2 mains, vérifier que la main secondaire est libre
            if (this.equippedItems.offHand) {
                console.warn(`⚠️ Impossible d'équiper ${item.name}: arme 2 mains nécessite les deux mains`);
                return false;
            }
        }

        if (slot === 'offHand') {
            // Si on veut équiper quelque chose en main secondaire, vérifier qu'il n'y a pas d'arme 2 mains
            const mainHandItem = this.equippedItems.mainHand;
            if (mainHandItem && this.isTwoHandedWeapon(mainHandItem)) {
                console.warn(`⚠️ Impossible d'équiper ${item.name}: ${mainHandItem.name} occupe les deux mains`);
                return false;
            }
        }

        return true;
    }

    // Détecter si une arme est 2 mains
    private isTwoHandedWeapon(item: InventoryItem): boolean {
        // Heuristique basique - à améliorer avec une vraie base de données
        const name = item.name.toLowerCase();
        return name.includes('bow') || 
               name.includes('staff') || 
               name.includes('greatsword') ||
               name.includes('battleaxe') ||
               name.includes('halberd') ||
               name.includes('crossbow');
    }

    // Appliquer/retirer les bonus d'un item
    private applyItemBonus(item: InventoryItem, apply: boolean): void {
        if (!item.stats) {
            return;
        }

        const multiplier = apply ? 1 : -1;
        
        // Pour l'instant, on log les changements
        // TODO: Intégrer avec vrai système de stats du personnage
        Object.entries(item.stats).forEach(([stat, value]) => {
            const change = value * multiplier;
            console.log(`📊 ${stat}: ${apply ? '+' : ''}${change} (${item.name})`);
        });
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
            if (item?.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    if (stats.hasOwnProperty(stat)) {
                        (stats as any)[stat] += value;
                    }
                });
            }
        });

        return stats;
    }

    // Obtenir l'équipement actuel
    getEquippedItems(): EquipmentSlots {
        return { ...this.equippedItems };
    }

    // Obtenir un item équipé spécifique
    getEquippedItem(slot: keyof EquipmentSlots): InventoryItem | undefined {
        return this.equippedItems[slot];
    }

    // Vérifier si un slot est occupé
    isSlotEquipped(slot: keyof EquipmentSlots): boolean {
        return !!this.equippedItems[slot];
    }

    // Échanger deux items entre slots (si possible)
    swapItems(fromSlot: keyof EquipmentSlots, toSlot: keyof EquipmentSlots): boolean {
        const fromItem = this.equippedItems[fromSlot];
        const toItem = this.equippedItems[toSlot];

        if (!fromItem) {
            return false;
        }

        // Vérifier que l'item peut être équipé dans le nouveau slot
        if (!this.canEquipItem(fromItem, toSlot)) {
            return false;
        }

        // Si il y a un item de destination, vérifier qu'il peut aller dans le slot source
        if (toItem && !this.canEquipItem(toItem, fromSlot)) {
            return false;
        }

        // Effectuer l'échange
        this.equippedItems[toSlot] = fromItem;
        if (toItem) {
            this.equippedItems[fromSlot] = toItem;
        } else {
            delete this.equippedItems[fromSlot];
        }

        console.log(`🔄 Échange entre ${fromSlot} et ${toSlot}`);
        return true;
    }

    // Auto-équiper le meilleur équipement disponible
    autoEquipBest(availableItems: InventoryItem[]): void {
        console.log('🤖 Auto-équipement en cours...');

        // Trier les items par valeur/rareté
        const sortedItems = availableItems
            .filter(item => item.equipSlot)
            .sort((a, b) => {
                // Priorité par rareté puis par valeur
                const rarityWeight = {
                    'legendary': 5,
                    'epic': 4,
                    'rare': 3,
                    'uncommon': 2,
                    'common': 1
                };
                
                const aWeight = rarityWeight[a.rarity] * 1000 + a.value;
                const bWeight = rarityWeight[b.rarity] * 1000 + b.value;
                
                return bWeight - aWeight;
            });

        // Essayer d'équiper chaque item
        sortedItems.forEach(item => {
            if (item.equipSlot && this.canEquipItem(item, item.equipSlot)) {
                const currentItem = this.equippedItems[item.equipSlot];
                
                // Équiper si le slot est libre ou si le nouvel item est meilleur
                if (!currentItem || this.isItemBetter(item, currentItem)) {
                    this.equipItem(item, item.equipSlot);
                }
            }
        });

        console.log('✅ Auto-équipement terminé');
    }

    // Comparer deux items pour déterminer lequel est meilleur
    private isItemBetter(newItem: InventoryItem, currentItem: InventoryItem): boolean {
        // Comparaison simple par valeur et rareté
        const rarityWeight = {
            'legendary': 5,
            'epic': 4,
            'rare': 3,
            'uncommon': 2,
            'common': 1
        };

        const newScore = rarityWeight[newItem.rarity] * 1000 + newItem.value;
        const currentScore = rarityWeight[currentItem.rarity] * 1000 + currentItem.value;

        return newScore > currentScore;
    }

    // Obtenir un résumé de l'équipement
    getEquipmentSummary(): string {
        const equipped = Object.entries(this.equippedItems);
        if (equipped.length === 0) {
            return 'Aucun équipement';
        }

        const summary = equipped.map(([slot, item]) => {
            return `${slot}: ${item!.name}`;
        }).join(', ');

        const stats = this.getTotalStats();
        const statsStr = Object.entries(stats)
            .filter(([, value]) => value > 0)
            .map(([stat, value]) => `${stat}: +${value}`)
            .join(', ');

        return `${summary} | Bonus: ${statsStr}`;
    }

    // Sauvegarder l'état de l'équipement
    serialize(): string {
        return JSON.stringify(this.equippedItems);
    }

    // Charger l'état de l'équipement
    deserialize(data: string): void {
        try {
            this.equippedItems = JSON.parse(data);
            console.log('✅ Équipement chargé');
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'équipement:', error);
            this.equippedItems = {};
        }
    }
}

export default EquipmentManager;