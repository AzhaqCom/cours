import { CharacterClass } from '../../types/Character';
import type { SpellSlots } from '../../types/Progression';
import { ClassFactory } from '../base/ClassFactory';
import type { ClassDefinitionConfig } from '../base/ClassDefinition';
import { XP_TABLE } from '../../types/Progression';

const SORCERER_SUBCLASSES = [
    {
        id: 'Draconic Bloodline',
        name: 'Lignée Draconique',
        description: 'Pouvoir magique hérité des dragons',
        color: 'red'
    },
    {
        id: 'Wild Magic',
        name: 'Magie Sauvage',
        description: 'Magie imprévisible et chaotique',
        color: 'rainbow'
    },
    {
        id: 'Storm Sorcery',
        name: 'Sorcellerie de Tempête',
        description: 'Pouvoir sur les éléments et la foudre',
        color: 'blue'
    }
];

// Même progression de sorts que le Wizard pour simplifier
const SORCERER_SPELL_SLOTS: Record<number, SpellSlots> = {
    1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
};

const sorcererConfig: ClassDefinitionConfig = {
    id: CharacterClass.SORCERER,
    name: 'Ensorceleur',
    hitDie: 6,
    spellcaster: true,
    subclassLevel: 1, // Sorcerer choisit dès le niveau 1
    subclasses: SORCERER_SUBCLASSES,

    generateFeatures: () => [
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
    ],

    generateProgression: () => {
        const progression: Record<number, any> = {};
        
        for (let level = 1; level <= 20; level++) {
            const spellSlots = SORCERER_SPELL_SLOTS[level];
            const features = sorcererConfig.generateFeatures().filter(f => f.level === level);
            
            progression[level] = {
                level,
                xpRequired: XP_TABLE[level] || 0,
                hitDieIncrease: 6,
                spellSlots,
                features,
                proficiencyBonus: Math.ceil(1 + level / 4),
                canChooseSubclass: level === sorcererConfig.subclassLevel
            };
        }
        
        return progression;
    }
};

export const SorcererClass = ClassFactory.createClass(sorcererConfig);