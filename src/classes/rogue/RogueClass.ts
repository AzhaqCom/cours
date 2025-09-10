import { CharacterClass } from '../../types/Character';
import { ClassFactory } from '../base/ClassFactory';
import type { ClassDefinitionConfig } from '../base/ClassDefinition';
import { XP_TABLE } from '../../types/Progression';

const ROGUE_SUBCLASSES = [
    {
        id: 'Thief',
        name: 'Voleur',
        description: 'Spécialiste de l\'infiltration et du vol',
        color: 'green'
    },
    {
        id: 'Assassin',
        name: 'Assassin',
        description: 'Tueur silencieux et mortel',
        color: 'red'
    },
    {
        id: 'Arcane Trickster',
        name: 'Filou Mystique',
        description: 'Voleur utilisant la magie pour ses méfaits',
        color: 'purple'
    }
];

const rogueConfig: ClassDefinitionConfig = {
    id: CharacterClass.ROGUE,
    name: 'Roublard',
    hitDie: 8,
    spellcaster: false, // Sauf Arcane Trickster mais on simplifie
    subclassLevel: 3,
    subclasses: ROGUE_SUBCLASSES,

    generateFeatures: () => [
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
    ],

    generateProgression: () => {
        const progression: Record<number, any> = {};
        
        for (let level = 1; level <= 20; level++) {
            const features = rogueConfig.generateFeatures().filter(f => f.level === level);
            
            progression[level] = {
                level,
                xpRequired: XP_TABLE[level] || 0,
                hitDieIncrease: 8,
                features,
                proficiencyBonus: Math.ceil(1 + level / 4),
                canChooseSubclass: level === rogueConfig.subclassLevel
            };
        }
        
        return progression;
    }
};

export const RogueClass = ClassFactory.createClass(rogueConfig);