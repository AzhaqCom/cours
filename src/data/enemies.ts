import type { CombatEntity } from '../types/CombatEntity';

export const enemies: Record<string, CombatEntity> = {
    // CR 1/8 - TRÈS FAIBLE
    kobold: {
        id: 'kobold',
        name: 'Kobold',
        maxHp: 5,
        ac: 12,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 7,
            dexterity: 15,
            constitution: 9,
            intelligence: 8,
            wisdom: 7,
            charisma: 8
        },
        weaponIds: ['dagger', 'sling'],
        attackBonus: 4,
        damageBonus: 2,
        aiRole: 'skirmisher',
        aiPriorities: ['ranged_attack', 'melee_attack']
    },

    // CR 1/4 - FAIBLE
    goblin: {
        id: 'goblin',
        name: 'Gobelin',
        maxHp: 7,
        ac: 15,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 8,
            dexterity: 14,
            constitution: 10,
            intelligence: 10,
            wisdom: 8,
            charisma: 8
        },
        weaponIds: ['scimitar', 'shortbow'],
        attackBonus: 4,
        damageBonus: 2,
        aiRole: 'skirmisher',
        aiPriorities: ['melee_attack', 'ranged_attack'],
        image: 'https://www.aidedd.org/dnd/images/goblin.jpg'
    },

    skeleton: {
        id: 'skeleton',
        name: 'Squelette',
        maxHp: 13,
        ac: 13,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 10,
            dexterity: 14,
            constitution: 15,
            intelligence: 6,
            wisdom: 8,
            charisma: 5
        },
        weaponIds: ['shortsword', 'shortbow'],
        attackBonus: 4,
        damageBonus: 2,
        aiRole: 'archer',
        aiPriorities: ['ranged_attack', 'melee_attack']
    },

    // CR 1/2 - MOYEN-FAIBLE
    orc: {
        id: 'orc',
        name: 'Orc',
        maxHp: 15,
        ac: 13,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 16,
            dexterity: 12,
            constitution: 16,
            intelligence: 7,
            wisdom: 11,
            charisma: 10
        },
        weaponIds: ['greataxe', 'javelin'],
        attackBonus: 5,
        damageBonus: 3,
        aiRole: 'berserker',
        aiPriorities: ['melee_attack']
    },

    hobgoblin: {
        id: 'hobgoblin',
        name: 'Hobgobelin',
        maxHp: 11,
        ac: 18, // Cotte de mailles + bouclier
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 13,
            dexterity: 12,
            constitution: 12,
            intelligence: 10,
            wisdom: 10,
            charisma: 9
        },
        weaponIds: ['longsword', 'longbow'],
        attackBonus: 3,
        damageBonus: 1,
        aiRole: 'tank',
        aiPriorities: ['melee_attack', 'defend']
    },

    // CR 1 - MOYEN
    bugbear: {
        id: 'bugbear',
        name: 'Bugbear',
        maxHp: 27,
        ac: 16,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 15,
            dexterity: 14,
            constitution: 13,
            intelligence: 8,
            wisdom: 11,
            charisma: 9
        },
        weaponIds: ['morningstar', 'javelin'],
        attackBonus: 4,
        damageBonus: 2,
        aiRole: 'berserker',
        aiPriorities: ['melee_attack']
    },

    dire_wolf: {
        id: 'dire_wolf',
        name: 'Loup Sanguinaire',
        maxHp: 37,
        ac: 14,
        movement: 10, // 50 pieds = 10 CASES
        stats: {
            strength: 17,
            dexterity: 15,
            constitution: 15,
            intelligence: 3,
            wisdom: 12,
            charisma: 7
        },
        weaponIds: ['bite'], // Natural weapon
        attackBonus: 5,
        damageBonus: 3,
        aiRole: 'skirmisher',
        aiPriorities: ['melee_attack', 'move_to_cover']
    },

    // CR 2 - MOYEN-FORT
    ogre: {
        id: 'ogre',
        name: 'Ogre',
        maxHp: 59,
        ac: 11,
        movement: 8, // 40 pieds = 8 CASES
        stats: {
            strength: 19,
            dexterity: 8,
            constitution: 16,
            intelligence: 5,
            wisdom: 7,
            charisma: 7
        },
        weaponIds: ['greatclub', 'javelin'],
        attackBonus: 6,
        damageBonus: 4,
        aiRole: 'tank',
        aiPriorities: ['melee_attack']
    },

    // CR 3 - FORT
    owlbear: {
        id: 'owlbear',
        name: 'Ours-Hibou',
        maxHp: 59,
        ac: 13,
        movement: 8, // 40 pieds = 8 CASES
        stats: {
            strength: 20,
            dexterity: 12,
            constitution: 17,
            intelligence: 3,
            wisdom: 12,
            charisma: 7
        },
        weaponIds: ['claws', 'beak'], // Natural weapons
        attackBonus: 7,
        damageBonus: 5,
        aiRole: 'berserker',
        aiPriorities: ['melee_attack']
    },

    // MAGES ET CASTERS
    goblin_shaman: {
        id: 'goblin_shaman',
        name: 'Shaman Gobelin',
        maxHp: 9,
        ac: 13,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 8,
            dexterity: 14,
            constitution: 10,
            intelligence: 12,
            wisdom: 14,
            charisma: 8
        },
        weaponIds: ['quarterstaff'],
        attackBonus: 2,
        damageBonus: -1,
        spellIds: ['Fire Bolt'],
        spellModifier: 4,
        aiRole: 'caster',
        aiPriorities: ['ranged_attack', 'move_to_cover']
    },

    cult_fanatic: {
        id: 'cult_fanatic',
        name: 'Fanatique du Culte',
        maxHp: 33,
        ac: 13,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 11,
            dexterity: 14,
            constitution: 12,
            intelligence: 10,
            wisdom: 13,
            charisma: 14
        },
        weaponIds: ['dagger'],
        attackBonus: 4,
        damageBonus: 2,
        spellIds: ['Sacred Flame', 'Cure Wounds'],
        spellModifier: 4,
        aiRole: 'caster',
        aiPriorities: ['ranged_attack', 'move_to_cover']
    },

    // ARCHERS SPÉCIALISÉS
    goblin_archer: {
        id: 'goblin_archer',
        name: 'Archer Gobelin',
        maxHp: 9,
        ac: 15,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 8,
            dexterity: 16,
            constitution: 10,
            intelligence: 10,
            wisdom: 12,
            charisma: 8
        },
        weaponIds: ['dagger', 'longbow'],
        attackBonus: 5,
        damageBonus: 3,
        aiRole: 'archer',
        aiPriorities: ['ranged_attack', 'move_to_cover']
    },

    // SUPPORTS ET HEALERS
    acolyte: {
        id: 'acolyte',
        name: 'Acolyte',
        maxHp: 9,
        ac: 10,
        movement: 6, // 30 pieds = 6 CASES
        stats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 14,
            charisma: 11
        },
        weaponIds: ['quarterstaff'],
        attackBonus: 2,
        damageBonus: 0,
        spellIds: ['Sacred Flame', 'Cure Wounds'],
        spellModifier: 4,
        aiRole: 'support',
        aiPriorities: ['move_to_cover', 'ranged_attack']
    }
};

// Utility functions
export const getEnemiesByRole = (role: string): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.aiRole === role);
};

export const getEnemiesByLevel = (minHp: number, maxHp: number): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.maxHp >= minHp && enemy.maxHp <= maxHp);
};

export const getCasters = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.spellIds && enemy.spellIds.length > 0);
};

export const getMeleeEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => 
        enemy.aiRole === 'berserker' || enemy.aiRole === 'tank'
    );
};

export const getRangedEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => 
        enemy.aiRole === 'archer' || enemy.aiRole === 'caster'
    );
};

export const getEnemiesWithWeapon = (weaponId: string): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.weaponIds.includes(weaponId));
};

export const getEnemiesWithSpell = (spellId: string): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => 
        enemy.spellIds && enemy.spellIds.includes(spellId)
    );
};

export const getWeakEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.maxHp <= 15);
};

export const getStrongEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.maxHp >= 30);
};

export const getFastEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.movement >= 8);
};

export const getArmoredEnemies = (): CombatEntity[] => {
    return Object.values(enemies).filter(enemy => enemy.ac >= 15);
};

export const calculateEnemyInitiative = (enemy: CombatEntity): number => {
    const dexMod = Math.floor((enemy.stats.dexterity - 10) / 2);
    return dexMod + Math.floor(Math.random() * 20) + 1; // 1d20 + DEX mod
};

export const getEnemyAttackBonus = (enemy: CombatEntity): number => {
    return enemy.attackBonus;
};

export const getEnemySpellAttackBonus = (enemy: CombatEntity): number => {
    return enemy.spellModifier || 0;
};