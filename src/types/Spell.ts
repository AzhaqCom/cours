import type { CharacterClass } from './Character';

// Type de cible pour les sorts
export type SpellTarget = 'self' | 'touch' | 'ally' | 'allies' | 'enemy' | 'enemies' | 'area' | 'cone' | 'line';

// École de magie
export const SpellSchool = {
    Evocation: 'Evocation',
    Abjuration: 'Abjuration',
    Divination: 'Divination',
    Enchantment: 'Enchantement',
    Illusion: 'Illusion',
    Conjuration: 'Invocation',
    Necromancy: 'Nécromancie',
    Transmutation: 'Transmutation'
} as const;

export type SpellSchool = typeof SpellSchool[keyof typeof SpellSchool];

// Type de dégâts magiques
export type DamageType =
  | 'Acid'
  | 'Bludgeoning'
  | 'Cold'
  | 'Fire'
  | 'Force'
  | 'Lightning'
  | 'Necrotic'
  | 'Piercing'
  | 'Poison'
  | 'Psychic'
  | 'Radiant'
  | 'Slashing'
  | 'Thunder';

// Interface principale pour un sort
export interface Spell {
    id: string;
    name: string;
    level: number; // 0 pour cantrips, 1-9 pour sorts
    spellSchool: SpellSchool;
    
    // Portée et ciblage
    range: number; // En CASES (0 = touch, -1 = self)
    target: SpellTarget;
    projectile?: number; // Nombre de projectiles
    areaSize?: number; // Taille de zone en CASES
    
    // Effets
    spellEffect: SpellEffect;
    
    // Description
    description: string;
    
    // Classes autorisées
    classes: CharacterClass[];
    
    // Utilisation
    usableInCombat?: boolean;
    usableOutOfCombat?: boolean;
    concentration?: boolean;
    ritual?: boolean;
}

// Effet d'un sort
export interface SpellEffect {
    effect: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility' | 'teleport' | 'counter';
    type?: DamageType | string; // Pour damage ou autres effets
    dice: string; // "1d6", "2d8", etc.
    bonus: number; // +1, +2, etc.
    duration?: number; // En tours (pour buff/debuff)
    condition?: string; // Pour debuff (paralyzed, etc.)
}

// Slot de sorts par niveau
export interface SpellSlots {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
    level6: number;
    level7: number;
    level8: number;
    level9: number;
}