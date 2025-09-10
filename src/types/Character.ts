export const CharacterClass = {
    FIGHTER: 'Fighter',
    WIZARD: 'Wizard',
    ROGUE: 'Rogue',
    SORCERER: 'Sorcerer',
    CLERIC: 'Cleric',
    WARLOCK: 'Warlock',
    BARD: 'Bard',
    DRUID: 'Druid',
    PALADIN: 'Paladin',
    RANGER: 'Ranger'
} as const;

export type CharacterClass = typeof CharacterClass[keyof typeof CharacterClass];

export interface Stats {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}
export interface Character {
    name: string;
    level: number;
    class: CharacterClass;
    currentXP: number;
    stats: Stats;
    hp: number;
    maxHp: number;
    armorClass: number;
    spells: string[];
    inventory: string[];
}