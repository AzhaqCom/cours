import { CharacterClass } from './Character';

// === SYSTÈME DE SORTS D&D ===
// Les emplacements de sorts par niveau (1st level, 2nd level, etc.)
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

// === SOUS-CLASSES D&D ===
export type WizardSchool = 
    | 'Abjuration'
    | 'Conjuration' 
    | 'Divination'
    | 'Enchantment'
    | 'Evocation'
    | 'Illusion'
    | 'Necromancy'
    | 'Transmutation';

export type FighterArchetype =
    | 'Champion'
    | 'Battle Master'
    | 'Eldritch Knight';

export type RogueArchetype =
    | 'Thief'
    | 'Assassin'
    | 'Arcane Trickster';

export type SorcererOrigin =
    | 'Draconic Bloodline'
    | 'Wild Magic';

// Union de toutes les sous-classes
export type Subclass = WizardSchool | FighterArchetype | RogueArchetype | SorcererOrigin;

// === CAPACITÉS SPÉCIALES PAR NIVEAU ===
export interface ClassFeature {
    id: string;
    name: string;
    description: string;
    level: number;
    class: CharacterClass;
    subclass?: Subclass;
}

// === PROGRESSION COMPLÈTE D&D ===
export interface LevelProgression {
    level: number;
    xpRequired: number;
    hitDieIncrease: number;  // Dé de vie à ajouter (d6 pour wizard, d10 pour fighter, etc.)
    spellSlots?: SpellSlots; // Seulement pour les classes magiques
    features: ClassFeature[]; // Nouvelles capacités débloquées
    proficiencyBonus: number; // Bonus de maîtrise D&D
    canChooseSubclass?: boolean; // True si on peut choisir sa spécialisation
}

// === TABLE XP OFFICIELLE D&D ===
export const XP_TABLE: Record<number, number> = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000
};

// === HIT DIE PAR CLASSE ===
export const HIT_DIE: Partial<Record<CharacterClass, number>> = {
    [CharacterClass.WIZARD]: 6,
    [CharacterClass.SORCERER]: 6,
    [CharacterClass.ROGUE]: 8,
    [CharacterClass.FIGHTER]: 10
};