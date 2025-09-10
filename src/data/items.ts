import type { Item } from '../types/Item';

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
    }
};