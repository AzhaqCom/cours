import type { Item, InventoryItem } from '../types/Item';

export const items: Record<string, Item> = {
    // Potions
    health_potion_small: {
        id: 'health_potion_small',
        name: 'Potion de soins mineure',
        description: 'Restaure 2d4+2 points de vie',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 50,
        stackable: true,
        maxStack: 10,
        uses: 1,
        effects: [
            {
                type: 'heal',
                target: 'self',
                value: '2d4+2',
                stat: 'hp'
            }
        ]
    },
    
    // Armes basiques
    short_sword: {
        id: 'short_sword',
        name: 'Épée courte',
        description: 'Une épée légère et bien équilibrée',
        type: 'weapon',
        weaponType: 'sword',
        rarity: 'common',
        value: 10,
        stackable: false,
        damage: '1d6',
        damageType: 'slashing',
        twoHanded: false
    },
    
    // Armures basiques
    leather_armor: {
        id: 'leather_armor',
        name: 'Armure de cuir',
        description: 'Protection légère en cuir souple',
        type: 'armor',
        armorType: 'light',
        rarity: 'common',
        value: 10,
        stackable: false,
        slot: 'chest',
        armorClass: 11,
        maxDexBonus: 99  // Pas de limite pour armure légère
    },
    
    // Items pour compagnons
    healing_potion: {
        id: 'healing_potion',
        name: 'Potion de soin',
        description: 'Restaure la santé',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 5,
        stackable: true,
        maxStack: 10,
        uses: 1,
        effects: [
            {
                type: 'heal',
                target: 'self',
                stat: 'hp',
                value: '2d4+2',
                description: 'Restaure 2d4+2 points de vie'
            }
        ]
    },

    longsword: {
        id: 'longsword',
        name: 'Épée longue',
        description: 'Une épée longue bien équilibrée',
        type: 'weapon',
        weaponType: 'sword',
        rarity: 'common',
        value: 15,
        stackable: false,
        damage: '1d8',
        damageType: 'slashing',
        twoHanded: false,
        requirements: {
            level: 1
        }
    },

    chainmail: {
        id: 'chainmail',
        name: 'Cotte de mailles',
        description: 'Une armure de mailles entrelacées',
        type: 'armor',
        armorType: 'medium',
        slot: 'chest',
        rarity: 'common',
        value: 50,
        stackable: false,
        armorClass: 13,
        maxDexBonus: 2,
        requirements: {
            level: 1
        }
    }
};

// Fonction utilitaire pour créer des InventoryItem
export function createInventoryItem(itemId: string, quantity: number = 1, equipped: boolean = false): InventoryItem {
    const item = items[itemId];
    if (!item) {
        throw new Error(`Item inconnu: ${itemId}`);
    }

    return {
        item,
        quantity,
        equipped,
        slot: equipped ? (item.type === 'armor' ? (item as any).slot : 
                        item.type === 'weapon' ? 'mainHand' : undefined) : undefined
    };
}