import { create } from 'zustand';
import type { SpellSlots, ClassFeature } from '../types/Progression';
import { XP_TABLE } from '../types/Progression';
import { classRegistry } from '../classes';
import type { CharacterClass } from '../types/Character';
import type { Character } from '../types/Character';
interface GameState {
    // État du jeu
    currentSceneId: string;
    gameFlags: Record<string, boolean>;
    playerGold: number;
    playerInventory: string[];

    // === PROGRESSION D&D ===
    playerLevel: number;        // ← Remettre ça
    currentXP: number;          // ← Et ça
    playerMaxHP: number;        // ← Et ça
    playerCurrentHP: number;    // ← Et ça
    playerSubclass?: string;
    playerFeatures: ClassFeature[];
    playerSpellSlots?: SpellSlots;
    showLevelUpModal: boolean;
    pendingLevelUp: boolean; // True si le joueur a assez d'XP mais n'a pas encore level up

    // Actions de base
    changeScene: (sceneId: string) => void;
    addFlags: (flags: Record<string, boolean>) => void;
    modifyGold: (amount: number) => void;
    addItem: (item: string) => void;
    initializePlayer: (character: Character) => void;
    // === ACTIONS DE PROGRESSION ===
    gainXP: (amount: number) => void;
    levelUp: (characterClass: CharacterClass, chosenSubclass?: string) => void;
    setShowLevelUpModal: (show: boolean) => void;
    checkLevelUp: (characterClass: CharacterClass) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
    // État initial
    currentSceneId: 'forest_entrance',
    gameFlags: {},
    playerGold: 50,
    playerInventory: [],

    // Progression initiale
    playerLevel: 1,
    currentXP: 0,
    playerMaxHP: 0, // Sera initialisé avec initializePlayer
    playerCurrentHP: 0,
    playerFeatures: [],
    showLevelUpModal: false,
    pendingLevelUp: false,
    initializePlayer: (character) => set({
        playerMaxHP: character.maxHp,
        playerCurrentHP: character.hp,
        playerLevel: character.level,
        currentXP: character.currentXP
        // Initialise tout en une fois
    }),
    // Actions de base
    changeScene: (sceneId) => set({ currentSceneId: sceneId }),
    addFlags: (flags) => set((state) => ({
        gameFlags: { ...state.gameFlags, ...flags }
    })),
    modifyGold: (amount) => set((state) => ({
        playerGold: state.playerGold + amount
    })),
    addItem: (item) => set((state) => ({
        playerInventory: [...state.playerInventory, item]
    })),

    // === LOGIQUE DE PROGRESSION ===
    gainXP: (amount) => set((state) => {
        const newXP = state.currentXP + amount;
        
        // Déterminer le niveau maximum atteignable avec cette XP
        let maxLevel = state.playerLevel;
        for (let level = state.playerLevel + 1; level <= 20; level++) {
            const xpRequired = XP_TABLE[level];
            if (xpRequired && newXP >= xpRequired) {
                maxLevel = level;
            } else {
                break;
            }
        }
        
        // Si on peut level up, montrer la modal
        const canLevelUp = maxLevel > state.playerLevel;

        return {
            currentXP: newXP,
            pendingLevelUp: canLevelUp,
            showLevelUpModal: canLevelUp
        };
    }),

    checkLevelUp: (characterClass) => {
        const state = get();
        const nextLevel = state.playerLevel + 1;
        const progression = classRegistry.getProgression(characterClass, nextLevel);

        if (!progression) return false; // Pas de progression définie pour cette classe/niveau

        return state.currentXP >= progression.xpRequired;
    },

    levelUp: (characterClass, chosenSubclass) => set((state) => {
        const nextLevel = state.playerLevel + 1;
        const progression = classRegistry.getProgression(characterClass, nextLevel);

        if (!progression) return state;

        // Calculer nouveaux HP (simulé avec moyenne du dé)
        const averageHPGain = Math.ceil(progression.hitDieIncrease / 2) + 1;

        // Vérifier si on peut encore level up après ce level
        let canLevelUpAgain = false;
        for (let level = nextLevel + 1; level <= 20; level++) {
            const xpRequired = XP_TABLE[level];
            const hasProgression = classRegistry.getProgression(characterClass, level);
            
            if (xpRequired && state.currentXP >= xpRequired && hasProgression) {
                canLevelUpAgain = true;
                break;
            }
        }

        return {
            playerLevel: nextLevel,
            playerSubclass: chosenSubclass || state.playerSubclass,
            playerFeatures: [...state.playerFeatures, ...progression.features],
            playerSpellSlots: progression.spellSlots || state.playerSpellSlots,
            pendingLevelUp: canLevelUpAgain,
            showLevelUpModal: canLevelUpAgain,
            playerMaxHP: state.playerMaxHP + averageHPGain,
            playerCurrentHP: state.playerCurrentHP + averageHPGain,
        };
    }),

    setShowLevelUpModal: (show) => set({ showLevelUpModal: show })
}));