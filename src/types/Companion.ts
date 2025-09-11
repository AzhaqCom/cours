import type { CombatEntity } from './CombatEntity';
import type { InventoryItem } from './Item';

// Type de progression simplifiée pour les compagnons
export type CompanionProgressionPath = 'warrior' | 'mage' | 'support';

// Slots d'équipement pour les compagnons
export interface CompanionEquipmentSlots {
    mainHand?: InventoryItem;
    offHand?: InventoryItem;
    head?: InventoryItem;
    chest?: InventoryItem;
    legs?: InventoryItem;
    feet?: InventoryItem;
    hands?: InventoryItem;
    ring?: InventoryItem;
    neck?: InventoryItem;
}

// Interface pour un compagnon
export interface Companion extends CombatEntity {
    // Progression
    level: number;
    xp: number;
    progressionPath: CompanionProgressionPath;
    
    // Inventaire propre (utilise le même système que le joueur)
    inventory: InventoryItem[];
    
    // Équipement actuel (slots d'équipement)
    equipped: CompanionEquipmentSlots;
    
    // Relation avec le joueur
    relationshipLevel: number;  // 0-100
    recruited: boolean;
    recruitmentScene?: string;  // ID de la scène où il a été recruté
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