import type { Character } from "../types/Character";
import { useGameStore } from "../store/gameStore";

interface CharacterCardProps {
    character: Character;
    onBack?: () => void
}

export function CharacterCard({ character, onBack }: CharacterCardProps) {
    const playerCurrentHP = useGameStore(state => state.playerCurrentHP);
    const playerMaxHP = useGameStore(state => state.playerMaxHP);
    const playerLevel = useGameStore(state => state.playerLevel);
    const currentXP = useGameStore(state => state.currentXP);
    const playerSubclass = useGameStore(state => state.playerSubclass);
    
    // Utilise les HP du store si disponibles, sinon fallback sur character
    const displayHP = playerMaxHP > 0 ? playerCurrentHP : character.hp;
    const displayMaxHP = playerMaxHP > 0 ? playerMaxHP : character.maxHp;
    const displayLevel = playerLevel > 1 ? playerLevel : character.level;
    const displayXP = currentXP > 0 ? currentXP : character.currentXP;

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">{character.name}</h2>
            <div className="flex items-center gap-2 mb-4">
                <p className="text-xl text-gray-400">{character.class}</p>
                {playerSubclass && (
                    <span className="text-sm bg-purple-600 px-2 py-1 rounded text-white">
                        {playerSubclass}
                    </span>
                )}
            </div>

            {/* Stats dynamiques */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 p-3 rounded">
                    <div className="text-red-400 text-sm">Points de Vie</div>
                    <div className="text-white font-bold">❤️ {displayHP}/{displayMaxHP}</div>
                </div>
                
                <div className="bg-gray-700 p-3 rounded">
                    <div className="text-blue-400 text-sm">Classe d'Armure</div>
                    <div className="text-white font-bold">🛡️ {character.armorClass}</div>
                </div>
                
                <div className="bg-gray-700 p-3 rounded">
                    <div className="text-yellow-400 text-sm">Niveau</div>
                    <div className="text-white font-bold">⭐ {displayLevel}</div>
                </div>
                
                <div className="bg-gray-700 p-3 rounded">
                    <div className="text-green-400 text-sm">Expérience</div>
                    <div className="text-white font-bold">🎯 {displayXP} XP</div>
                </div>
            </div>

            {/* Caractéristiques */}
            <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-300 mb-3">Caractéristiques</h3>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Force</div>
                        <div className="text-white font-bold">{character.stats.strength}</div>
                    </div>
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Dextérité</div>
                        <div className="text-white font-bold">{character.stats.dexterity}</div>
                    </div>
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Constitution</div>
                        <div className="text-white font-bold">{character.stats.constitution}</div>
                    </div>
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Intelligence</div>
                        <div className="text-white font-bold">{character.stats.intelligence}</div>
                    </div>
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Sagesse</div>
                        <div className="text-white font-bold">{character.stats.wisdom}</div>
                    </div>
                    <div className="text-center bg-gray-700 p-2 rounded">
                        <div className="text-xs text-gray-400">Charisme</div>
                        <div className="text-white font-bold">{character.stats.charisma}</div>
                    </div>
                </div>
            </div>

            {/* Bouton optionnel */}
            {onBack && (
                <button onClick={onBack} className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-all">
                    Retour
                </button>
            )}
        </div>
    )
}