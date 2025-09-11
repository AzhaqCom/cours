import type { Companion } from '../types/Companion';
import { createInventoryItem } from './items';

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
            createInventoryItem('healing_potion', 2, false),
            createInventoryItem('longsword', 1, true),
            createInventoryItem('chainmail', 1, true)
        ],
        equipped: {
            mainHand: createInventoryItem('longsword', 1, true),
            chest: createInventoryItem('chainmail', 1, true)
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