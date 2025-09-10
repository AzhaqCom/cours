import { CharacterClass } from "../types/Character";
import type { Character } from "../types/Character";

export const starterCharacters: Partial<Record<CharacterClass, Character>> = {
    [CharacterClass.WIZARD]: {
        name: 'Eldrin',
        level: 1,
        class: CharacterClass.WIZARD,
        currentXP: 0,
        stats: {
            strength: 10,
            dexterity: 14,
            constitution: 10,
            intelligence: 15,
            wisdom: 13,
            charisma: 11
        },
        hp: 10,
        maxHp: 10,
        armorClass: 10,
        spells: ['Fire Bolt', 'Ray of Frost', 'Magic Missile'],
        inventory: ['Quarterstaff']
    },
       [CharacterClass.SORCERER]: {
        name: 'Elarion',
        level: 1,
        class: CharacterClass.SORCERER,
        currentXP: 0,
        stats: {
            strength: 10,
            dexterity: 14,
            constitution: 10,
            intelligence: 15,
            wisdom: 13,
            charisma: 11
        },
        hp: 10,
        maxHp: 10,
        armorClass: 10,
        spells: ['Fire Bolt', 'Ray of Frost', 'Magic Missile'],
        inventory: ['Quarterstaff']
    },
    [CharacterClass.FIGHTER]: {
        name: 'Thorin',
        level: 1,
        class: CharacterClass.FIGHTER,
        currentXP: 0,
        stats: {
            strength: 15,
            dexterity: 14,
            constitution: 13,
            intelligence: 10,
            wisdom: 10,
            charisma: 12
        },
        hp: 14,
        maxHp: 14,
        armorClass: 14,
        spells: [],
        inventory: ['Mace']
    }
    ,
    [CharacterClass.ROGUE]: {
        name: 'Lyra',
        level: 1,
        class: CharacterClass.ROGUE,
        currentXP: 0,
        stats: {
            strength: 13,
            dexterity: 15,
            constitution: 13,
            intelligence: 10,
            wisdom: 10,
            charisma: 12
        },
        hp: 10,
        maxHp: 10,
        armorClass: 10,
        spells: [],
        inventory: ['Dagger']
    }
}