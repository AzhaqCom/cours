import { useState, useEffect } from "react";
import type { Character } from "../types/Character";
import { SceneManager } from "./SceneManager";
import { FloatingPanel } from "./FloatingPanel";
import { CharacterCard } from "./CharacterCard";
import { SpellList } from "./SpellList";
import { InventoryPanel } from "./InventoryPanel";
import { InventoryPanel as AdvancedInventoryPanel } from "./inventory/InventoryPanel";
import { LevelUpModal } from "./LevelUpModal";
import { useGameStore } from '../store/gameStore';
import { useSceneStore, syncWithGameStore } from '../store/sceneStore';
import { useInventoryStore } from '../store/inventoryStore';

interface GameViewProps {
    character: Character;
}

export function GameView({ character }: GameViewProps) {
    // États des panneaux flottants
    const [showCharacterInfo, setShowCharacterInfo] = useState(false);
    const [showSpells, setShowSpells] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showAdvancedInventory, setShowAdvancedInventory] = useState(false);

    // Game Store (ancien système - on garde pour la progression)
    const {
        gameFlags,
        playerGold,
        playerInventory,
        currentXP,
        playerCurrentHP,
        playerMaxHP,
        playerLevel,
        addFlags,
        modifyGold,
        addItem,
        gainXP,
        showLevelUpModal
    } = useGameStore();

    // Scene Store (nouveau système)
    const {
        currentScene,
        isLoading,
        error,
        navigateToScene,
        handleChoice,
        goBack,
        resetToStart,
        sceneHistory
    } = useSceneStore();

    // Inventory Store
    const { 
        initializeEquipmentManager
    } = useInventoryStore();

    // Initialiser l'Equipment Manager au montage
    useEffect(() => {
        initializeEquipmentManager(character);
    }, [character, initializeEquipmentManager]);

    // Synchroniser les stores au changement
    useEffect(() => {
        syncWithGameStore({
            playerGold,
            playerInventory,
            gameFlags,
            currentXP,
            playerCurrentHP,
            playerMaxHP,
            playerLevel
        });
    }, [playerGold, playerInventory, gameFlags, currentXP, playerCurrentHP, playerMaxHP, playerLevel]);

    // Initialiser avec la première scène
    useEffect(() => {
        if (!currentScene) {
            navigateToScene('tavern_start');
        }
    }, [currentScene, navigateToScene]);

    // Gestionnaire de completion de scène
    const handleSceneComplete = (choiceId?: string) => {
        if (!currentScene || !choiceId) return;

        // Trouver le choix sélectionné
        const choice = currentScene.choices.find(c => c.id === choiceId);
        if (!choice) {
            console.error(`Choix non trouvé: ${choiceId}`);
            return;
        }

        // Appliquer les conséquences via le gameStore pour maintenir la compatibilité
        if (choice.consequences) {
            if (choice.consequences.flags) {
                addFlags(choice.consequences.flags);
            }
            if (choice.consequences.gold) {
                modifyGold(choice.consequences.gold);
            }
            if (choice.consequences.items) {
                choice.consequences.items.forEach(item => addItem(item));
            }
            if (choice.consequences.xp) {
                gainXP(choice.consequences.xp);
            }
        }

        // Naviguer via le scene store
        handleChoice(choice);
    };

    // Gestionnaire d'erreur
    const handleError = (errorMessage: string) => {
        console.error('Erreur SceneManager:', errorMessage);
        // TODO: Afficher une notification d'erreur à l'utilisateur
    };

    // Rendu pendant le chargement
    if (isLoading) {
        return (
            <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Chargement de la scène...</p>
                </div>
            </div>
        );
    }

    // Rendu en cas d'erreur
    if (error) {
        return (
            <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center bg-red-900 bg-opacity-50 p-8 rounded-lg max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-300">🚨 Erreur</h2>
                    <p className="text-red-200 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                            onClick={() => {
                                if (sceneHistory.length > 0) {
                                    goBack();
                                } else {
                                    resetToStart();
                                }
                            }}
                        >
                            {sceneHistory.length > 0 ? 'Retour' : 'Recommencer'}
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                            onClick={resetToStart}
                        >
                            Menu Principal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Rendu si pas de scène (ne devrait pas arriver)
    if (!currentScene) {
        return (
            <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Aucune scène chargée</h2>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded transition-colors"
                        onClick={() => navigateToScene('tavern_start')}
                    >
                        Commencer l'aventure
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 text-white flex">
            {/* Zone principale pour le SceneManager */}
            <div className="flex-1 pt-[100px] overflow-hidden">
                <SceneManager
                    scene={currentScene}
                    onSceneComplete={handleSceneComplete}
                    onError={handleError}
                />
            </div>

            {/* Barre de boutons latérale */}
            <div className="w-[60px] bg-gray-800 border-l border-gray-700 pt-[100px] flex flex-col items-center py-4 gap-3">
                <button
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all"
                    onClick={() => setShowCharacterInfo(true)}
                    title="Infos Personnage"
                >
                    👤
                </button>

                <button
                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all"
                    onClick={() => setShowInventory(true)}
                    title="Inventaire Simple"
                >
                    🎒
                </button>

                <button
                    className="w-12 h-12 bg-purple-700 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all"
                    onClick={() => setShowAdvancedInventory(true)}
                    title="Inventaire Avancé"
                >
                    ⚔️
                </button>

                {character.spells.length > 0 && (
                    <button
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all"
                        onClick={() => setShowSpells(true)}
                        title="Sorts"
                    >
                        ✨
                    </button>
                )}

                {/* Boutons de navigation debug (en développement) */}
                {import.meta.env.DEV && (
                    <>
                        <div className="w-full h-px bg-gray-600 my-2"></div>
                        
                        {sceneHistory.length > 0 && (
                            <button
                                className="w-12 h-12 bg-yellow-600 hover:bg-yellow-500 rounded-lg flex items-center justify-center transition-all text-xs"
                                onClick={goBack}
                                title="Retour"
                            >
                                ⬅️
                            </button>
                        )}
                        
                        <button
                            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all text-xs"
                            onClick={resetToStart}
                            title="Reset"
                        >
                            🔄
                        </button>

                        {/* Info debug */}
                        <div className="text-xs text-gray-400 text-center leading-tight">
                            {currentScene.id}
                            <br />
                            ({sceneHistory.length})
                        </div>
                    </>
                )}
            </div>

            {/* Floating Panels */}
            {showCharacterInfo && (
                <FloatingPanel
                    title="Infos Personnage"
                    onClose={() => setShowCharacterInfo(false)}
                >
                    <CharacterCard character={character} />
                </FloatingPanel>
            )}

            {showInventory && (
                <FloatingPanel
                    title="Inventaire"
                    onClose={() => setShowInventory(false)}
                >
                    <InventoryPanel character={character} />
                </FloatingPanel>
            )}

            {showSpells && (
                <FloatingPanel
                    title="Livre de Sorts"
                    onClose={() => setShowSpells(false)}
                >
                    <SpellList spellChara={character.spells} />
                </FloatingPanel>
            )}

            {/* Inventaire Avancé */}
            {showAdvancedInventory && (
                <AdvancedInventoryPanel
                    character={character}
                    onClose={() => setShowAdvancedInventory(false)}
                />
            )}

            {/* Level Up Modal */}
            {showLevelUpModal && (
                <LevelUpModal character={character} />
            )}
        </div>
    );
}