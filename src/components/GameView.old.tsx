import { useState } from "react";
import type { Character } from "../types/Character";
import { scenes } from '../data/scenes';
import type { Choice } from '../types/Scene';
import { FloatingPanel } from "./FloatingPanel";
import { CharacterCard } from "./CharacterCard";
import { SpellList } from "./SpellList";
import { InventoryPanel } from "./InventoryPanel";
import { useGameStore } from '../store/gameStore';
import { LevelUpModal } from "./LevelUpModal";
interface GameViewProps {
    character: Character;
}

export function GameView({ character }: GameViewProps) {
    const {
        currentSceneId,
        gameFlags,
        playerGold,

        changeScene,
        addFlags,
        modifyGold,
        addItem,
        gainXP,
        showLevelUpModal
    } = useGameStore();

    const [showCharacterInfo, setShowCharacterInfo] = useState(false);
    const [showSpells, setShowSpells] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const currentScene = scenes[currentSceneId];

    const handleChoice = (choice: Choice) => {
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
                gainXP(choice.consequences.xp)
            }
        }
        changeScene(choice.nextSceneId);
    }
    const canChoose = (choice: Choice) => {
        if (!choice.requirements) return true;

        if (choice.requirements.class) {
            if (!choice.requirements.class.includes(character.class)) return false;
        }

        if (choice.requirements.gold) {
            if (playerGold < choice.requirements.gold) return false;
        }

        if (choice.requirements.flags) {
            for (const flag of choice.requirements.flags) {
                if (!gameFlags[flag]) return false;
            }
        }

        return true;
    }
    return (
        <div className="h-screen bg-gray-900 text-white flex">
            {/* Zone principale pour les scènes */}
            <div className="flex-1 pt-[100px] overflow-y-auto">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-4">{currentScene.title}</h1>
                    <p className="text-gray-300 mb-8 leading-relaxed">{currentScene.description}</p>

                    {/* Choix disponibles */}
                    <div className="flex flex-col gap-3">
                        {currentScene.choices.map((choice) => {
                            const isDisabled = !canChoose(choice);
                            return (
                                <button
                                    key={choice.id}
                                    disabled={isDisabled}
                                    className={`text-left px-6 py-3 rounded-lg transition-all ${isDisabled
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                        }`}
                                    onClick={() => !isDisabled && handleChoice(choice)}
                                >
                                    {choice.text}
                                    {choice.requirements?.gold && (
                                        <span className="ml-2 text-yellow-400">({choice.requirements.gold} 💰)</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
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
                    title="Inventaire"
                >
                    🎒
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
            {/* Level Up Modal */}
            {showLevelUpModal && (
                <LevelUpModal
                    character={character}
                   
                />
            )}
        </div>
    );
}