import type { Character } from '../types/Character';

interface HotbarProps {
    character: Character;
    onOpenInventory: () => void;
}

export function Hotbar({ character,onOpenInventory }: HotbarProps) {
    // Calcul du pourcentage de vie
    const hpPercent = (character.hp / character.maxHp) * 100;

    return (
        <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Nom et classe */}
                <div>
                    <h2 className="text-xl font-bold text-white">{character.name}</h2>
                    <p className="text-sm text-gray-400">{character.class} Niveau {character.level}</p>
                </div>

                {/* Barre de vie */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="flex items-center gap-2">
                        <span className="text-white">❤️</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                            <div
                                className="bg-red-500 h-full transition-all duration-300"
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                        <span className="text-white text-sm">{character.hp}/{character.maxHp}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onOpenInventory}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                        🎒 Inventaire
                    </button>
                </div>
            </div>
        </div>
    );
}