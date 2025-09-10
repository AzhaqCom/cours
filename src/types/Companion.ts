import type { CombatEntity } from './CombatEntity';

// Type de progression simplifiée pour les compagnons
export type CompanionProgressionPath = 'warrior' | 'mage' | 'support';

// Interface pour un compagnon
export interface Companion extends CombatEntity {
    // Progression
    level: number;
    xp: number;
    progressionPath: CompanionProgressionPath;
    
    // Inventaire propre
    inventory: CompanionInventoryItem[];
    
    // Équipement actuel
    equipped: {
        mainHand?: string;  // weaponId
        offHand?: string;   // weaponId ou shieldId
        armor?: string;     // armorId
        accessory?: string; // accessoryId
    };
    
    // Relation avec le joueur
    relationshipLevel: number;  // 0-100
    recruited: boolean;
    recruitmentScene?: string;  // ID de la scène où il a été recruté
}

// Item dans l'inventaire d'un compagnon
export interface CompanionInventoryItem {
    itemId: string;
    quantity: number;
    equipped: boolean;
}

// Instance de compagnon avec état temporaire
export interface CompanionInstance {
    companion: Companion;
    temporaryBuffs?: {
        attackBonus?: number;
        damageBonus?: number;
        acBonus?: number;
    };
}

// Données de progression pour level up auto
export interface CompanionLevelUpData {
    level: number;
    statsIncrease: {
        maxHp?: number;
        attackBonus?: number;
        damageBonus?: number;
        spellModifier?: number;
    };
    newWeaponId?: string;
    newSpellIds?: string[];
}