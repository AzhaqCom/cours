import { CharacterClass } from '../../types/Character';
import { ClassFactory } from '../base/ClassFactory';
import type { ClassDefinitionConfig } from '../base/ClassDefinition';
import { XP_TABLE } from '../../types/Progression';

const FIGHTER_SUBCLASSES = [
    {
        id: 'Champion',
        name: 'Champion',
        description: 'Guerrier pur et simple, maître du combat au corps-à-corps',
        color: 'red'
    },
    {
        id: 'Battle Master',
        name: 'Maître de Guerre',
        description: 'Tacticien expert utilisant des manœuvres spéciales',
        color: 'orange'
    },
    {
        id: 'Eldritch Knight',
        name: 'Chevalier Mystique',
        description: 'Guerrier-mage combinant magie et épée',
        color: 'purple'
    }
];

const fighterConfig: ClassDefinitionConfig = {
    id: CharacterClass.FIGHTER,
    name: 'Guerrier',
    hitDie: 10,
    spellcaster: false,
    subclassLevel: 3,
    subclasses: FIGHTER_SUBCLASSES,

    generateFeatures: () => [
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
    ],

    generateProgression: () => {
        const progression: Record<number, any> = {};
        
        for (let level = 1; level <= 20; level++) {
            const features = fighterConfig.generateFeatures().filter(f => f.level === level);
            
            progression[level] = {
                level,
                xpRequired: XP_TABLE[level] || 0,
                hitDieIncrease: 10,
                features,
                proficiencyBonus: Math.ceil(1 + level / 4),
                canChooseSubclass: level === fighterConfig.subclassLevel
            };
        }
        
        return progression;
    }
};

export const FighterClass = ClassFactory.createClass(fighterConfig);