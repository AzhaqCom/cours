import { useGameStore } from '../store/gameStore';
import { XP_TABLE } from '../types/Progression';

export function Hotbar() {
    const currentHp = useGameStore(state => state.playerCurrentHP)
    const maxHp = useGameStore(state => state.playerMaxHP)
    const hpPercent = maxHp > 0 ? (currentHp / maxHp * 100) : 0;
    const playerGold = useGameStore(state => state.playerGold);
    const currentXp = useGameStore(state => state.currentXP)
    const currentLevel = useGameStore(state => state.playerLevel)
    
    // Calcul XP vers niveau suivant
    const nextLevel = currentLevel + 1;
    const xpRequired = XP_TABLE[nextLevel] || 0;
    const xpProgress = xpRequired > 0 ? ((currentXp - (XP_TABLE[currentLevel] || 0)) / (xpRequired - (XP_TABLE[currentLevel] || 0)) * 100) : 100;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[500px] h-[80px] bg-gray-800 border border-gray-700 rounded-lg z-50 shadow-lg">
            <div className="h-full px-4 py-2 flex flex-col justify-between">
                {/* Ligne du haut : HP et Or */}
                <div className="flex items-center justify-between">
                    {/* Barre de vie */}
                    <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold">❤️</span>
                        <div className="w-24 bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-red-500 h-full transition-all duration-300"
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                        <span className="text-white text-xs">{currentHp}/{maxHp}</span>
                    </div>

                    {/* Or */}
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-semibold">💰</span>
                        <span className="text-white font-semibold text-sm">{playerGold}</span>
                    </div>
                </div>

                {/* Ligne du bas : XP et Niveau */}
                <div className="flex items-center justify-between">
                    {/* Barre d'XP */}
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-semibold">⭐</span>
                        <span className="text-white text-xs">Niv.{currentLevel}</span>
                        <div className="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-300"
                                style={{ width: `${Math.min(xpProgress, 100)}%` }}
                            />
                        </div>
                        {xpRequired > 0 ? (
                            <span className="text-white text-xs">{currentXp}/{xpRequired}</span>
                        ) : (
                            <span className="text-green-400 text-xs">MAX</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}