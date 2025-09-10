import type { LevelProgression, ClassFeature, SpellSlots } from '../types/Progression';
import { CharacterClass } from '../types/Character';

// === CAPACITÉS PAR CLASSE ===
const WIZARD_FEATURES: ClassFeature[] = [
    {
        id: 'arcane_recovery',
        name: 'Récupération magique',
        description: 'Vous récupérez des emplacements de sort lors d\'un repos court.',
        level: 1,
        class: CharacterClass.WIZARD
    },
    {
        id: 'wizard_school',
        name: 'École de magie',
        description: 'Choisissez votre spécialisation magique.',
        level: 2,
        class: CharacterClass.WIZARD
    }
];

const FIGHTER_FEATURES: ClassFeature[] = [
    {
        id: 'fighting_style',
        name: 'Style de combat',
        description: 'Choisissez une spécialisation au combat.',
        level: 1,
        class: CharacterClass.FIGHTER
    },
    {
        id: 'second_wind',
        name: 'Second souffle',
        description: 'Récupérez 1d10 + niveau points de vie.',
        level: 1,
        class: CharacterClass.FIGHTER
    },
    {
        id: 'action_surge',
        name: 'Fougue',
        description: 'Prenez une action supplémentaire lors de votre tour.',
        level: 2,
        class: CharacterClass.FIGHTER
    }
];

const ROGUE_FEATURES: ClassFeature[] = [
    {
        id: 'sneak_attack',
        name: 'Attaque sournoise',
        description: 'Infligez des dégâts supplémentaires avec avantage.',
        level: 1,
        class: CharacterClass.ROGUE
    },
    {
        id: 'cunning_action',
        name: 'Action rapide',
        description: 'Dash, désengagement ou se cacher en action bonus.',
        level: 2,
        class: CharacterClass.ROGUE
    }
];

const SORCERER_FEATURES: ClassFeature[] = [
    {
        id: 'sorcerous_origin',
        name: 'Origine magique',
        description: 'Votre source de pouvoir magique.',
        level: 1,
        class: CharacterClass.SORCERER
    },
    {
        id: 'font_of_magic',
        name: 'Source de magie',
        description: 'Points de sorcellerie et métamagie.',
        level: 2,
        class: CharacterClass.SORCERER
    }
];

// === EMPLACEMENTS DE SORTS PAR NIVEAU ===
const WIZARD_SPELL_SLOTS: Record<number, SpellSlots> = {
    1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 }
};

const SORCERER_SPELL_SLOTS: Record<number, SpellSlots> = WIZARD_SPELL_SLOTS; // Même progression

// === TABLES DE PROGRESSION COMPLÈTES ===
export const CLASS_PROGRESSIONS: Partial<Record<CharacterClass, Record<number, LevelProgression>>> = {
    [CharacterClass.WIZARD]: {
        1: {
            level: 1,
            xpRequired: 0,
            hitDieIncrease: 6,
            spellSlots: WIZARD_SPELL_SLOTS[1],
            features: WIZARD_FEATURES.filter(f => f.level === 1),
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        2: {
            level: 2,
            xpRequired: 300,
            hitDieIncrease: 6,
            spellSlots: WIZARD_SPELL_SLOTS[2],
            features: WIZARD_FEATURES.filter(f => f.level === 2),
            proficiencyBonus: 2,
            canChooseSubclass: true
        },
        3: {
            level: 3,
            xpRequired: 900,
            hitDieIncrease: 6,
            spellSlots: WIZARD_SPELL_SLOTS[3],
            features: [],
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        4: {
            level: 4,
            xpRequired: 2700,
            hitDieIncrease: 6,
            spellSlots: WIZARD_SPELL_SLOTS[4],
            features: [],
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        5: {
            level: 5,
            xpRequired: 6500,
            hitDieIncrease: 6,
            spellSlots: WIZARD_SPELL_SLOTS[5],
            features: [],
            proficiencyBonus: 3,
            canChooseSubclass: false
        }
    },
    
    [CharacterClass.FIGHTER]: {
        1: {
            level: 1,
            xpRequired: 0,
            hitDieIncrease: 10,
            features: FIGHTER_FEATURES.filter(f => f.level === 1),
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        2: {
            level: 2,
            xpRequired: 300,
            hitDieIncrease: 10,
            features: FIGHTER_FEATURES.filter(f => f.level === 2),
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        3: {
            level: 3,
            xpRequired: 900,
            hitDieIncrease: 10,
            features: [],
            proficiencyBonus: 2,
            canChooseSubclass: true // Fighter choisit au niveau 3
        }
    },
    
    [CharacterClass.ROGUE]: {
        1: {
            level: 1,
            xpRequired: 0,
            hitDieIncrease: 8,
            features: ROGUE_FEATURES.filter(f => f.level === 1),
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        2: {
            level: 2,
            xpRequired: 300,
            hitDieIncrease: 8,
            features: ROGUE_FEATURES.filter(f => f.level === 2),
            proficiencyBonus: 2,
            canChooseSubclass: false
        },
        3: {
            level: 3,
            xpRequired: 900,
            hitDieIncrease: 8,
            features: [],
            proficiencyBonus: 2,
            canChooseSubclass: true // Rogue choisit au niveau 3
        }
    },
    
    [CharacterClass.SORCERER]: {
        1: {
            level: 1,
            xpRequired: 0,
            hitDieIncrease: 6,
            spellSlots: SORCERER_SPELL_SLOTS[1],
            features: SORCERER_FEATURES.filter(f => f.level === 1),
            proficiencyBonus: 2,
            canChooseSubclass: true // Sorcerer choisit dès le niveau 1
        },
        2: {
            level: 2,
            xpRequired: 300,
            hitDieIncrease: 6,
            spellSlots: SORCERER_SPELL_SLOTS[2],
            features: SORCERER_FEATURES.filter(f => f.level === 2),
            proficiencyBonus: 2,
            canChooseSubclass: false
        }
    }
};