import { create } from 'zustand';
import { useEffect } from 'react';
import type { Scene, Choice, Consequences } from '../types/Scene';
import type { CharacterClass } from '../types/Character';
import { scenes } from '../data/scenes';
import { useCompanionStore } from './companionStore';

// Interface pour l'état du système de scènes
interface SceneState {
    // État actuel
    currentScene: Scene | null;
    currentSceneId: string;
    sceneHistory: string[]; // Pour navigation back
    isLoading: boolean;
    error: string | null;
    
    // État du jeu
    playerData: {
        gold: number;
        inventory: string[];
        flags: Record<string, boolean>;
        xp: number;
        hp: number;
        maxHp: number;
        level: number;
    };
    
    // Actions pour navigation
    navigateToScene: (sceneId: string) => void;
    handleChoice: (choice: Choice) => void;
    goBack: () => void;
    resetToStart: () => void;
    
    // Actions pour gestion d'état
    applyConsequences: (consequences: Consequences) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Actions pour synchronisation avec gameStore
    syncPlayerData: (data: Partial<SceneState['playerData']>) => void;
    
    // Utilitaires
    canChoose: (choice: Choice, characterClass: CharacterClass) => boolean;
    getValidChoices: (characterClass: CharacterClass) => Choice[];
}

// Configuration initiale
const INITIAL_SCENE_ID = 'forest_entrance';
const INITIAL_PLAYER_DATA: SceneState['playerData'] = {
    gold: 50,
    inventory: [],
    flags: {},
    xp: 0,
    hp: 0,
    maxHp: 0,
    level: 1
};

export const useSceneStore = create<SceneState>((set, get) => ({
    // État initial
    currentScene: null,
    currentSceneId: INITIAL_SCENE_ID,
    sceneHistory: [],
    isLoading: false,
    error: null,
    playerData: { ...INITIAL_PLAYER_DATA },

    // Navigation vers une nouvelle scène
    navigateToScene: (sceneId: string) => {
        const state = get();
        
        try {
            set({ isLoading: true, error: null });
            
            // Vérifier que la scène existe
            const scene = scenes[sceneId];
            if (!scene) {
                throw new Error(`Scène non trouvée: ${sceneId}`);
            }
            
            // Ajouter la scène actuelle à l'historique si elle existe
            const newHistory = state.currentScene 
                ? [...state.sceneHistory, state.currentSceneId]
                : state.sceneHistory;
            
            // Mettre à jour l'état
            set({
                currentScene: scene,
                currentSceneId: sceneId,
                sceneHistory: newHistory,
                isLoading: false,
                error: null
            });
            
            console.log(`Navigation vers scène: ${scene.title} (${sceneId})`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur de navigation inconnue';
            console.error('Erreur navigation scène:', errorMessage);
            
            set({
                isLoading: false,
                error: errorMessage
            });
        }
    },

    // Gestion des choix du joueur
    handleChoice: (choice: Choice) => {
        const state = get();
        
        try {
            // Vérifier que le choix est valide
            if (!state.canChoose(choice, 'Fighter')) { // TODO: passer la vraie classe
                throw new Error(`Choix non disponible: ${choice.text}`);
            }
            
            console.log(`Choix sélectionné: ${choice.text}`);
            
            // Appliquer les conséquences si elles existent
            if (choice.consequences) {
                state.applyConsequences(choice.consequences);
            }
            
            // Naviguer vers la nouvelle scène
            state.navigateToScene(choice.nextSceneId);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du choix';
            console.error('Erreur choix:', errorMessage);
            
            set({ error: errorMessage });
        }
    },

    // Retourner à la scène précédente
    goBack: () => {
        const state = get();
        
        if (state.sceneHistory.length > 0) {
            const previousSceneId = state.sceneHistory[state.sceneHistory.length - 1];
            const newHistory = state.sceneHistory.slice(0, -1);
            
            const scene = scenes[previousSceneId];
            if (scene) {
                set({
                    currentScene: scene,
                    currentSceneId: previousSceneId,
                    sceneHistory: newHistory,
                    error: null
                });
                
                console.log(`Retour vers scène: ${scene.title} (${previousSceneId})`);
            }
        } else {
            console.warn('Aucune scène précédente dans l\'historique');
        }
    },

    // Recommencer depuis le début
    resetToStart: () => {
        const startScene = scenes[INITIAL_SCENE_ID];
        
        set({
            currentScene: startScene || null,
            currentSceneId: INITIAL_SCENE_ID,
            sceneHistory: [],
            isLoading: false,
            error: null,
            playerData: { ...INITIAL_PLAYER_DATA }
        });
        
        console.log('Jeu réinitialisé à la scène de départ');
    },

    // Appliquer les conséquences d'un choix
    applyConsequences: (consequences: Consequences) => {
        set((state) => {
            const newPlayerData = { ...state.playerData };
            
            // Modifier l'or
            if (consequences.gold !== undefined) {
                newPlayerData.gold = Math.max(0, newPlayerData.gold + consequences.gold);
                console.log(`Or modifié: ${consequences.gold > 0 ? '+' : ''}${consequences.gold} (total: ${newPlayerData.gold})`);
            }
            
            // Ajouter des items
            if (consequences.items) {
                newPlayerData.inventory = [...newPlayerData.inventory, ...consequences.items];
                console.log(`Items ajoutés:`, consequences.items);
            }
            
            // Retirer des items
            if (consequences.removeItems) {
                consequences.removeItems.forEach(itemToRemove => {
                    const index = newPlayerData.inventory.indexOf(itemToRemove);
                    if (index > -1) {
                        newPlayerData.inventory.splice(index, 1);
                        console.log(`Item retiré: ${itemToRemove}`);
                    }
                });
            }
            
            // Ajouter/modifier des flags
            if (consequences.flags) {
                newPlayerData.flags = { ...newPlayerData.flags, ...consequences.flags };
                console.log(`Flags modifiés:`, consequences.flags);
            }
            
            // Modifier XP
            if (consequences.xp !== undefined) {
                newPlayerData.xp = Math.max(0, newPlayerData.xp + consequences.xp);
                console.log(`XP modifiée: ${consequences.xp > 0 ? '+' : ''}${consequences.xp} (total: ${newPlayerData.xp})`);
            }
            
            // Modifier HP (dégâts)
            if (consequences.damage !== undefined) {
                newPlayerData.hp = Math.max(0, newPlayerData.hp - consequences.damage);
                console.log(`Dégâts subis: ${consequences.damage} HP (restant: ${newPlayerData.hp})`);
            }
            
            // Modifier HP (soins)
            if (consequences.heal !== undefined) {
                newPlayerData.hp = Math.min(newPlayerData.maxHp, newPlayerData.hp + consequences.heal);
                console.log(`HP soignés: ${consequences.heal} (total: ${newPlayerData.hp}/${newPlayerData.maxHp})`);
            }
            
            // Ajout de compagnons
            if (consequences.companions) {
                const companionStore = useCompanionStore.getState();
                consequences.companions.forEach(companionId => {
                    companionStore.addCompanionById(companionId);
                });
            }
            
            return {
                playerData: newPlayerData
            };
        });
    },

    // État de chargement
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // Gestion d'erreur
    setError: (error: string | null) => set({ error }),

    // Synchronisation avec le gameStore
    syncPlayerData: (data: Partial<SceneState['playerData']>) => {
        set((state) => ({
            playerData: { ...state.playerData, ...data }
        }));
    },

    // Vérifier si un choix est disponible
    canChoose: (choice: Choice, characterClass: CharacterClass) => {
        const state = get();
        const { playerData } = state;
        
        if (!choice.requirements) return true;
        
        // Vérifier la classe
        if (choice.requirements.class && choice.requirements.class.length > 0) {
            if (!choice.requirements.class.includes(characterClass)) {
                return false;
            }
        }
        
        // Vérifier l'or
        if (choice.requirements.gold !== undefined) {
            if (playerData.gold < choice.requirements.gold) {
                return false;
            }
        }
        
        // Vérifier le niveau
        if (choice.requirements.level !== undefined) {
            if (playerData.level < choice.requirements.level) {
                return false;
            }
        }
        
        // Vérifier les items requis
        if (choice.requirements.items) {
            for (const requiredItem of choice.requirements.items) {
                if (!playerData.inventory.includes(requiredItem)) {
                    return false;
                }
            }
        }
        
        // Vérifier les flags
        if (choice.requirements.flags) {
            for (const requiredFlag of choice.requirements.flags) {
                if (!playerData.flags[requiredFlag]) {
                    return false;
                }
            }
        }
        
        return true;
    },

    // Obtenir tous les choix valides pour la scène actuelle
    getValidChoices: (characterClass: CharacterClass) => {
        const state = get();
        
        if (!state.currentScene) return [];
        
        return state.currentScene.choices.filter(choice => 
            state.canChoose(choice, characterClass)
        );
    }
}));

// Hook pour initialiser le store avec la première scène
export const useInitializeSceneStore = () => {
    const navigateToScene = useSceneStore(state => state.navigateToScene);
    
    useEffect(() => {
        // Initialiser avec la première scène si pas déjà fait
        navigateToScene(INITIAL_SCENE_ID);
    }, [navigateToScene]);
};

// Utilitaire pour synchroniser avec le gameStore
export const syncWithGameStore = (gameStoreData: {
    playerGold: number;
    playerInventory: string[];
    gameFlags: Record<string, boolean>;
    currentXP: number;
    playerCurrentHP: number;
    playerMaxHP: number;
    playerLevel: number;
}) => {
    const syncPlayerData = useSceneStore.getState().syncPlayerData;
    
    syncPlayerData({
        gold: gameStoreData.playerGold,
        inventory: gameStoreData.playerInventory,
        flags: gameStoreData.gameFlags,
        xp: gameStoreData.currentXP,
        hp: gameStoreData.playerCurrentHP,
        maxHp: gameStoreData.playerMaxHP,
        level: gameStoreData.playerLevel
    });
};