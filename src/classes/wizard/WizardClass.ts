import { CharacterClass } from '../../types/Character';
import type { SpellSlots } from '../../types/Progression';
import { ClassFactory } from '../base/ClassFactory';
import type { ClassDefinitionConfig } from '../base/ClassDefinition';
import { XP_TABLE } from '../../types/Progression';

const WIZARD_SUBCLASSES = [
    {
        id: 'Abjuration',
        name: 'Abjuration',
        description: 'Maître de la protection et des barrières',
        color: 'blue'
    },
    {
        id: 'Conjuration',
        name: 'Conjuration', 
        description: 'Invoque créatures et objets',
        color: 'green'
    },
    {
        id: 'Divination',
        name: 'Divination',
        description: 'Révèle secrets et prédit l\'avenir',
        color: 'yellow'
    },
    {
        id: 'Enchantment',
        name: 'Enchantment',
        description: 'Contrôle l\'esprit et les émotions',
        color: 'pink'
    },
    {
        id: 'Evocation',
        name: 'Evocation',
        description: 'Spécialiste des sorts de dégâts et destruction',
        color: 'red'
    },
    {
        id: 'Illusion',
        name: 'Illusion',
        description: 'Maître des illusions et tromperies',
        color: 'purple'
    },
    {
        id: 'Necromancy',
        name: 'Necromancy',
        description: 'Manipule la mort et la non-vie',
        color: 'gray'
    },
    {
        id: 'Transmutation',
        name: 'Transmutation',
        description: 'Transforme la matière et l\'énergie',
        color: 'orange'
    }
];

const WIZARD_SPELL_SLOTS: Record<number, SpellSlots> = {
    1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    // TODO: Compléter jusqu'au niveau 20
};

const wizardConfig: ClassDefinitionConfig = {
    id: CharacterClass.WIZARD,
    name: 'Magicien',
    hitDie: 6,
    spellcaster: true,
    subclassLevel: 2,
    subclasses: WIZARD_SUBCLASSES,

    generateFeatures: () => [
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
    ],

    generateProgression: () => {
        const progression: Record<number, any> = {};
        
        for (let level = 1; level <= 20; level++) {
            const spellSlots = WIZARD_SPELL_SLOTS[level];
            const features = wizardConfig.generateFeatures().filter(f => f.level === level);
            
            progression[level] = {
                level,
                xpRequired: XP_TABLE[level] || 0,
                hitDieIncrease: 6,
                spellSlots,
                features,
                proficiencyBonus: Math.ceil(1 + level / 4), // Formule D&D standard
                canChooseSubclass: level === wizardConfig.subclassLevel
            };
        }
        
        return progression;
    }
};

export const WizardClass = ClassFactory.createClass(wizardConfig);