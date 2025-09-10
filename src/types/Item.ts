// Types d'items
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc' | 'currency';

// Rareté des items
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Types d'armes
export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'bow' | 'staff' | 'wand';

// Types d'armures
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

// Slots d'équipement
export type EquipmentSlot = 
    | 'mainHand' 
    | 'offHand' 
    | 'twoHand'
    | 'head' 
    | 'chest' 
    | 'legs' 
    | 'feet' 
    | 'hands' 
    | 'ring' 
    | 'neck';

// Interface de base pour tous les items
export interface BaseItem {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    value: number;  // Prix en or
    weight?: number;
    icon?: string;  // Icône ou image
    stackable: boolean;
    maxStack?: number;
    
    // Requirements pour utiliser l'item
    requirements?: {
        level?: number;
        class?: string[];  // Classes autorisées
        strength?: number;
        dexterity?: number;
        intelligence?: number;
    };
}

// Item d'arme
export interface WeaponItem extends BaseItem {
    type: 'weapon';
    weaponType: WeaponType;
    damage: string;  // Format dice "1d8+2"
    damageType?: 'slashing' | 'piercing' | 'bludgeoning' | 'magic';
    range?: number;  // Pour armes à distance
    twoHanded: boolean;
    
    // Bonus et enchantements
    attackBonus?: number;
    damageBonus?: number;
    criticalRange?: number;  // 20 par défaut, 19-20 pour certaines armes
    
    // Propriétés spéciales
    properties?: WeaponProperty[];
}

// Item d'armure
export interface ArmorItem extends BaseItem {
    type: 'armor';
    armorType: ArmorType;
    slot: EquipmentSlot;
    armorClass: number;
    maxDexBonus?: number;  // Pour armures moyennes/lourdes
    
    // Pénalités
    stealthDisadvantage?: boolean;
    speedReduction?: number;
    
    // Bonus
    resistances?: string[];  // Types de dégâts résistés
}

// Item consommable
export interface ConsumableItem extends BaseItem {
    type: 'consumable';
    consumableType: 'potion' | 'scroll' | 'food' | 'bomb';
    uses: number;  // Nombre d'utilisations
    
    // Effets
    effects: ItemEffect[];
    
    // Combat only?
    combatOnly?: boolean;
    
    // Cooldown
    cooldown?: number;  // En tours
}

// Item de quête
export interface QuestItem extends BaseItem {
    type: 'quest';
    questId?: string;  // Référence à la quête associée
    unique: boolean;  // Ne peut pas être vendu/jeté
}

// Item divers
export interface MiscItem extends BaseItem {
    type: 'misc';
    // Items génériques, composants de craft, etc.
}

// Union type pour tous les items
export type Item = WeaponItem | ArmorItem | ConsumableItem | QuestItem | MiscItem;

// Propriétés spéciales des armes
export interface WeaponProperty {
    name: string;
    description: string;
    effect?: {
        type: 'damage' | 'status' | 'lifesteal' | 'elemental';
        value?: string | number;
        chance?: number;  // % de chance d'activation
    };
}

// Effets des items
export interface ItemEffect {
    type: 'heal' | 'damage' | 'buff' | 'debuff' | 'restore' | 'teleport';
    target: 'self' | 'enemy' | 'ally' | 'area';
    value?: number | string;  // Nombre ou dice
    duration?: number;  // En tours pour buffs/debuffs
    stat?: 'hp' | 'mp' | 'strength' | 'dexterity' | 'intelligence' | 'ac' | 'speed';
    description?: string;
}

// Instance d'item dans l'inventaire
export interface InventoryItem {
    item: Item;
    quantity: number;
    equipped?: boolean;
    slot?: EquipmentSlot;
}

// Item dans un magasin
export interface ShopItem {
    itemId: string;  // Référence vers Item.id
    quantity: number;  // -1 pour infini
    priceMultiplier?: number;  // Modificateur de prix (1 par défaut)
    availability?: {
        minLevel?: number;
        requiresFlag?: string;
    };
}