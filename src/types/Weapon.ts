// Types d'armes
export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'bow' | 'crossbow' | 'staff' | 'wand' | 'simple' | 'martial' | 'natural';

// Type de dégâts
export type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'magic' | 'none';

// Interface pour une arme
export interface Weapon {
    id: string;
    name: string;
    type: WeaponType;
    category?: 'melee' | 'ranged' | 'natural';
    
    // Dégâts de base (sans modificateurs)
    damageDice: string;  // "1d6", "2d4", etc.
    damageType: DamageType;
    
    // Combat
    range: number | { min: number; max: number };  // En CASES (1 pour mêlée, plus pour distance)
    twoHanded: boolean;
    
    // Propriétés optionnelles
    finesse?: boolean;  // Utilise DEX au lieu de STR
    light?: boolean;    // Peut dual-wield
    heavy?: boolean;    // Désavantage pour petites créatures
    thrown?: boolean;   // Peut être lancée
    thrownRange?: number | { min: number; max: number }; // Portée si lancée
    ammunition?: boolean;  // Nécessite des munitions
    ammunitionType?: string; // Type de munitions
    versatileDamage?: string; // Dégâts si utilisée à 2 mains
    maxRange?: number; // Portée maximale
    specialRules?: string[]; // Règles spéciales
    properties?: string[];  // Array de propriétés additionnelles
    requirements?: {
        proficiency?: string[];
        attunement?: boolean;
        level?: number;
        strength?: number;
    }; // Requirements pour utiliser l'arme
    
    // Valeur et rareté
    value: number;  // En pièces d'or
    weight?: number; // En livres
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'epic' | 'legendary';
    
    // Description
    description?: string;
    
    // Bonus magiques (pour armes enchantées)
    magicalBonus?: number;  // +1, +2, +3 etc.
    bonusDamage?: string; // Dégâts bonus
    bonusDamageType?: string; // Type de dégâts bonus
    specialProperties?: WeaponProperty[];
    magicalProperties?: string[]; // Propriétés magiques
}

// Propriétés spéciales des armes magiques
export interface WeaponProperty {
    id: string;
    name: string;
    description: string;
    effect: {
        type: 'damage' | 'status' | 'vampiric' | 'elemental';
        value?: string | number;
        damageType?: DamageType;
    };
}

// Munitions pour armes à distance
export interface Ammunition {
    id: string;
    name: string;
    quantity: number;
    damageBonus?: number;  // Flèches +1, etc.
    specialEffect?: string;
}