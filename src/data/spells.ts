import type { Spell } from '../types/Spell';
import { SpellSchool } from '../types/Spell';
import {CharacterClass} from '../types/Character'


export const spells: Record<string, Spell> = {
    // CANTRIPS (Level 0)
    'Fire Bolt': {
        id: 'fire_bolt',
        name: 'Fire Bolt',
        description: 'Lance un trait de feu sur l\'ennemi',
        level: 0,
        projectile: 1,
        range: 24, // 120 pieds = 24 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Fire',
            dice: '1d10',
            bonus: 0
        },
        classes: [CharacterClass.WIZARD, CharacterClass.SORCERER]
    },
    'Ray of Frost': {
        id: 'ray_of_frost',
        name: 'Ray of Frost',
        description: 'Un faisceau glacial de lumière bleuâtre se dirige vers une créature dans la portée du sort',
        level: 0,
        projectile: 1,
        range: 12, // 60 pieds = 12 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Cold',
            dice: '1d8',
            bonus: 0
        },
        classes: [CharacterClass.WIZARD, CharacterClass.SORCERER]
    },
    'Sacred Flame': {
        id: 'sacred_flame',
        name: 'Sacred Flame',
        description: 'Une flamme radieuse descend sur une créature que vous pouvez voir',
        level: 0,
        projectile: 1,
        range: 12, // 60 pieds = 12 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Radiant',
            dice: '1d8',
            bonus: 0
        },
        classes: [CharacterClass.CLERIC]
    },
    'Eldritch Blast': {
        id: 'eldritch_blast',
        name: 'Eldritch Blast',
        description: 'Un faisceau d\'énergie crépitante fonce vers une créature',
        level: 0,
        projectile: 1,
        range: 24, // 120 pieds = 24 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Force',
            dice: '1d10',
            bonus: 0
        },
        classes: [CharacterClass.WARLOCK]
    },
    'Mage Hand': {
        id: 'mage_hand',
        name: 'Mage Hand',
        description: 'Une main spectrale flottante apparaît',
        level: 0,
        projectile: 0,
        range: 6, // 30 pieds = 6 CASES
        target: 'self',
        spellSchool: SpellSchool.Conjuration,
        spellEffect: {
            effect: 'utility',
            type: 'Force',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.WIZARD, CharacterClass.SORCERER, CharacterClass.WARLOCK]
    },
    'Minor Illusion': {
        id: 'minor_illusion',
        name: 'Minor Illusion',
        description: 'Vous créez un son ou l\'image d\'un objet',
        level: 0,
        projectile: 0,
        range: 6, // 30 pieds = 6 CASES
        target: 'area',
        spellSchool: SpellSchool.Illusion,
        spellEffect: {
            effect: 'utility',
            type: 'Illusion',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.BARD, CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.WIZARD]
    },

    // LEVEL 1 SPELLS
    'Magic Missile': {
        id: 'magic_missile',
        name: 'Magic Missile',
        description: 'Vous créez trois fléchettes de force magique d\'un bleu lumineux. Chaque fléchette atteint une créature de votre choix que vous pouvez voir et dans la limite de portée du sort. Chaque projectile inflige 1d4 + 1 dégâts de force à sa cible',
        level: 1,
        projectile: 3,
        range: 24, // 120 pieds = 24 CASES
        target: 'enemies',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Force',
            dice: '1d4',
            bonus: 1
        },
        classes: [CharacterClass.WIZARD, CharacterClass.SORCERER]
    },
    'Cure Wounds': {
        id: 'cure_wounds',
        name: 'Cure Wounds',
        description: 'Une créature que vous touchez récupère des points de vie',
        level: 1,
        projectile: 0,
        range: 0, // Toucher
        target: 'ally',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'heal',
            type: 'Heal',
            dice: '1d8',
            bonus: 0
        },
        classes: [CharacterClass.BARD, CharacterClass.CLERIC, CharacterClass.DRUID, CharacterClass.PALADIN, CharacterClass.RANGER]
    },
    'Shield': {
        id: 'shield',
        name: 'Shield',
        description: 'Une barrière invisible de force magique vous protège',
        level: 1,
        projectile: 0,
        range: 0, // Soi-même
        target: 'self',
        spellSchool: SpellSchool.Abjuration,
        spellEffect: {
            effect: 'buff',
            type: 'AC',
            dice: '0',
            bonus: 5
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Burning Hands': {
        id: 'burning_hands',
        name: 'Burning Hands',
        description: 'Une mince nappe de flammes surgit de vos doigts tendus',
        level: 1,
        projectile: 0,
        range: 3, // Cône de 15 pieds = 3 CASES
        target: 'area',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Fire',
            dice: '3d6',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Sleep': {
        id: 'sleep',
        name: 'Sleep',
        description: 'Ce sort plonge les créatures dans un sommeil magique',
        level: 1,
        projectile: 0,
        range: 18, // 90 pieds = 18 CASES
        target: 'area',
        spellSchool: SpellSchool.Enchantment,
        spellEffect: {
            effect: 'debuff',
            type: 'Sleep',
            dice: '5d8',
            bonus: 0
        },
        classes: [CharacterClass.BARD, CharacterClass.SORCERER, CharacterClass.WIZARD]
    },

    // LEVEL 2 SPELLS
    'Scorching Ray': {
        id: 'scorching_ray',
        name: 'Scorching Ray',
        description: 'Vous créez trois rayons de feu et les projetez sur des cibles',
        level: 2,
        projectile: 3,
        range: 24, // 120 pieds = 24 CASES
        target: 'enemies',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Fire',
            dice: '2d6',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Web': {
        id: 'web',
        name: 'Web',
        description: 'Vous conjurez une masse de toiles épaisses et collantes',
        level: 2,
        projectile: 0,
        range: 12, // 60 pieds = 12 CASES
        target: 'area',
        spellSchool: SpellSchool.Conjuration,
        spellEffect: {
            effect: 'debuff',
            type: 'Restrained',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Misty Step': {
        id: 'misty_step',
        name: 'Misty Step',
        description: 'Entouré brièvement d\'une brume argentée, vous vous téléportez',
        level: 2,
        projectile: 0,
        range: 6, // 30 pieds = 6 CASES
        target: 'self',
        spellSchool: SpellSchool.Conjuration,
        spellEffect: {
            effect: 'teleport',
            type: 'Teleport',
            dice: '0',
            bonus: 6
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.WIZARD]
    },
    'Hold Person': {
        id: 'hold_person',
        name: 'Hold Person',
        description: 'Choisissez un humanoïde que vous pouvez voir dans la portée du sort',
        level: 2,
        projectile: 0,
        range: 12, // 60 pieds = 12 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Enchantment,
        spellEffect: {
            effect: 'debuff',
            type: 'Paralyzed',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.BARD, CharacterClass.CLERIC, CharacterClass.DRUID, CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.WIZARD]
    },

    // LEVEL 3 SPELLS
    'Fireball': {
        id: 'fireball',
        name: 'Fireball',
        description: 'Un éclair de feu lumineux jaillit de votre doigt pointé',
        level: 3,
        projectile: 0,
        range: 30, // 150 pieds = 30 CASES
        target: 'area',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Fire',
            dice: '8d6',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Lightning Bolt': {
        id: 'lightning_bolt',
        name: 'Lightning Bolt',
        description: 'Un éclair formant une ligne de 100 pieds de long et 5 pieds de large',
        level: 3,
        projectile: 0,
        range: 20, // 100 pieds ligne = 20 CASES
        target: 'area',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Lightning',
            dice: '8d6',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Counterspell': {
        id: 'counterspell',
        name: 'Counterspell',
        description: 'Vous tentez d\'interrompre une créature en train de lancer un sort',
        level: 3,
        projectile: 0,
        range: 12, // 60 pieds = 12 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Abjuration,
        spellEffect: {
            effect: 'counter',
            type: 'Counter',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.WIZARD]
    },
    'Mass Healing Word': {
        id: 'mass_healing_word',
        name: 'Mass Healing Word',
        description: 'Jusqu\'à six créatures de votre choix récupèrent des points de vie',
        level: 3,
        projectile: 0,
        range: 12, // 60 pieds = 12 CASES
        target: 'allies',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'heal',
            type: 'Heal',
            dice: '1d4',
            bonus: 0
        },
        classes: [CharacterClass.CLERIC]
    },

    // LEVEL 4 SPELLS
    'Dimension Door': {
        id: 'dimension_door',
        name: 'Dimension Door',
        description: 'Vous vous téléportez et une créature consentante',
        level: 4,
        projectile: 0,
        range: 100, // 500 pieds = 100 CASES
        target: 'self',
        spellSchool: SpellSchool.Conjuration,
        spellEffect: {
            effect: 'teleport',
            type: 'Teleport',
            dice: '0',
            bonus: 100
        },
        classes: [CharacterClass.BARD, CharacterClass.SORCERER, CharacterClass.WARLOCK, CharacterClass.WIZARD]
    },
    'Polymorph': {
        id: 'polymorph',
        name: 'Polymorph',
        description: 'Ce sort transforme une créature en bête',
        level: 4,
        projectile: 0,
        range: 12, // 60 pieds = 12 CASES
        target: 'enemy',
        spellSchool: SpellSchool.Transmutation,
        spellEffect: {
            effect: 'debuff',
            type: 'Polymorph',
            dice: '0',
            bonus: 0
        },
        classes: [CharacterClass.BARD, CharacterClass.DRUID, CharacterClass.SORCERER, CharacterClass.WIZARD]
    },
    'Wall of Fire': {
        id: 'wall_of_fire',
        name: 'Wall of Fire',
        description: 'Vous créez un mur de feu sur une surface solide',
        level: 4,
        projectile: 0,
        range: 24, // 120 pieds = 24 CASES
        target: 'area',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Fire',
            dice: '5d8',
            bonus: 0
        },
        classes: [CharacterClass.DRUID, CharacterClass.SORCERER, CharacterClass.WIZARD]
    },

    // LEVEL 5 SPELLS
    'Cone of Cold': {
        id: 'cone_of_cold',
        name: 'Cone of Cold',
        description: 'Une explosion d\'air froid surgit de vos mains',
        level: 5,
        projectile: 0,
        range: 12, // Cône de 60 pieds = 12 CASES
        target: 'area',
        spellSchool: SpellSchool.Evocation,
        spellEffect: {
            effect: 'damage',
            type: 'Cold',
            dice: '8d8',
            bonus: 0
        },
        classes: [CharacterClass.SORCERER, CharacterClass.WIZARD]
    }
};

// Utility functions
export const getSpellsByLevel = (level: number): Spell[] => {
    return Object.values(spells).filter(spell => spell.level === level);
};

export const getCantrips = (): Spell[] => {
    return getSpellsByLevel(0);
};

export const getSpellsBySchool = (school: SpellSchool): Spell[] => {
    return Object.values(spells).filter(spell => spell.spellSchool === school);
};

export const getDamageSpells = (): Spell[] => {
    return Object.values(spells).filter(spell => spell.spellEffect.effect === 'damage');
};

export const getHealingSpells = (): Spell[] => {
    return Object.values(spells).filter(spell => spell.spellEffect.effect === 'heal');
};

export const getSpellsWithRange = (minRange: number, maxRange?: number): Spell[] => {
    return Object.values(spells).filter(spell => {
        if (maxRange) {
            return spell.range >= minRange && spell.range <= maxRange;
        }
        return spell.range >= minRange;
    });
};

export const getAreaSpells = (): Spell[] => {
    return Object.values(spells).filter(spell => spell.target === 'area');
};

export const getSpellsForCombat = (): Spell[] => {
    return Object.values(spells).filter(spell => 
        spell.spellEffect.effect === 'damage' || 
        spell.spellEffect.effect === 'heal' || 
        spell.spellEffect.effect === 'buff' || 
        spell.spellEffect.effect === 'debuff'
    );
};

export const getSpellsByClass = (characterClass: CharacterClass): Spell[] => {
    return Object.values(spells).filter(spell => spell.classes.includes(characterClass));
};

export const calculateSpellDamage = (spell: Spell, spellLevel: number, modifier: number): number => {
    if (spell.spellEffect.effect !== 'damage') return 0;
    
    const baseDice = spell.spellEffect.dice;
    let totalDamage = 0;
    
    // Parse dice notation (e.g., "3d6", "1d8")
    const diceMatch = baseDice.match(/(\d+)d(\d+)/);
    if (diceMatch) {
        const numDice = parseInt(diceMatch[1]);
        const dieSize = parseInt(diceMatch[2]);
        
        // Calculate average damage
        const avgDieRoll = (dieSize + 1) / 2;
        totalDamage = numDice * avgDieRoll + spell.spellEffect.bonus;
        
        // Add spell modifier for most damage spells
        if (spell.spellEffect.type !== 'Force' && spell.level > 0) {
            totalDamage += modifier;
        }
        
        // Handle upcast scaling
        if (spellLevel > spell.level) {
            const levelDiff = spellLevel - spell.level;
            totalDamage += levelDiff * avgDieRoll;
        }
    }
    
    return Math.floor(totalDamage);
};

export const calculateSpellHealing = (spell: Spell, spellLevel: number, modifier: number): number => {
    if (spell.spellEffect.effect !== 'heal') return 0;
    
    const baseDice = spell.spellEffect.dice;
    let totalHealing = 0;
    
    // Parse dice notation
    const diceMatch = baseDice.match(/(\d+)d(\d+)/);
    if (diceMatch) {
        const numDice = parseInt(diceMatch[1]);
        const dieSize = parseInt(diceMatch[2]);
        
        // Calculate average healing
        const avgDieRoll = (dieSize + 1) / 2;
        totalHealing = numDice * avgDieRoll + spell.spellEffect.bonus;
        
        // Add spell modifier
        totalHealing += modifier;
        
        // Handle upcast scaling
        if (spellLevel > spell.level) {
            const levelDiff = spellLevel - spell.level;
            totalHealing += levelDiff * avgDieRoll;
        }
    }
    
    return Math.floor(totalHealing);
};