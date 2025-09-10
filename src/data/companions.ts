import type { Companion } from '../types/Companion';

export const companions: Record<string, Companion> = {
    // WARRIOR - Compagnon guerrier de base
    lyra: {
        id: 'lyra',
        name: 'Lyra',
        maxHp: 25,
        ac: 16,
        movement: 6,
        stats: {
            strength: 16,
            dexterity: 12,
            constitution: 14,
            intelligence: 10,
            wisdom: 11,
            charisma: 13
        },
        weaponIds: ['longsword', 'shield'],
        attackBonus: 5,
        damageBonus: 3,
        aiRole: 'tank',
        aiPriorities: ['melee_attack', 'defend'],
        
        // Companion-specific properties
        level: 1,
        xp: 0,
        progressionPath: 'warrior',
        inventory: [
            { itemId: 'healing_potion', quantity: 2, equipped: false },
            { itemId: 'longsword', quantity: 1, equipped: true },
            { itemId: 'chainmail', quantity: 1, equipped: true }
        ],
        equipped: {
            mainHand: 'longsword',
            offHand: 'shield',
            armor: 'chainmail'
        },
        relationshipLevel: 25,
        recruited: false,
        recruitmentScene: 'tavern_encounter'
    }
};

// Utility functions
export const getCompanionsByPath = (path: string): Companion[] => {
    return Object.values(companions).filter(companion => companion.progressionPath === path);
};

export const getRecruitedCompanions = (): Companion[] => {
    return Object.values(companions).filter(companion => companion.recruited);
};

export const getAvailableCompanions = (): Companion[] => {
    return Object.values(companions).filter(companion => !companion.recruited);
};