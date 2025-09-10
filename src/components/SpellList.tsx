import { spells } from "../data/spells";
import { useGameStore } from "../store/gameStore";

interface SpellListProps {
    spellChara: string[];
}

export function SpellList({ spellChara }: SpellListProps) {
    const playerSpellSlots = useGameStore(state => state.playerSpellSlots);
    const playerSubclass = useGameStore(state => state.playerSubclass);

    return (
        <div className="space-y-4 w-[600px]">
            {/* Emplacements de sorts */}
            {playerSpellSlots && (
                <div className="bg-gray-700 rounded-lg p-4 border border-blue-400">
                    <h3 className="text-lg font-bold text-blue-400 mb-3">✨ Emplacements de sorts disponibles</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {playerSpellSlots.level1 > 0 && (
                            <div className="text-center">
                                <div className="text-blue-300 font-semibold">Niveau 1</div>
                                <div className="text-white">{playerSpellSlots.level1} slots</div>
                            </div>
                        )}
                        {playerSpellSlots.level2 > 0 && (
                            <div className="text-center">
                                <div className="text-purple-300 font-semibold">Niveau 2</div>
                                <div className="text-white">{playerSpellSlots.level2} slots</div>
                            </div>
                        )}
                        {playerSpellSlots.level3 > 0 && (
                            <div className="text-center">
                                <div className="text-pink-300 font-semibold">Niveau 3</div>
                                <div className="text-white">{playerSpellSlots.level3} slots</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Spécialisation */}
            {playerSubclass && (
                <div className="bg-gray-700 rounded-lg p-4 border border-purple-400">
                    <h3 className="text-lg font-bold text-purple-400 mb-2">🎯 Spécialisation</h3>
                    <div className="text-white font-semibold">{playerSubclass}</div>
                </div>
            )}

            <div className="space-y-4">
            {spellChara.map((spellName) => {
                const spell = spells[spellName];
                if (!spell) return null;

                return (
                    <div key={spellName} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        {/* En-tête du sort */}
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-white">{spell.name}</h3>
                            <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">
                                {spell.spellSchool}
                            </span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{spell.description}</p>
                        
                        {/* Statistiques du sort */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                            <div>
                                <span className="text-red-400">🎯 Dégâts:</span> {spell.spellEffect.dice}
                                {spell.spellEffect.bonus > 0 && `+${spell.spellEffect.bonus}`}
                            </div>
                            <div>
                                <span className="text-blue-400">📏 Portée:</span> {spell.range}m
                            </div>
                            <div>
                                <span className="text-yellow-400">🔥 Type:</span> {spell.spellEffect.type}
                            </div>
                            <div>
                                <span className="text-green-400">💫 Projectiles:</span> {spell.projectile}
                            </div>
                        </div>
                        
                        {/* Classes autorisées */}
                        <div className="mt-3 pt-2 border-t border-gray-600">
                            <span className="text-xs text-gray-500">Classes: </span>
                            <span className="text-xs text-blue-300">
                                {spell.classes.join(', ')}
                            </span>
                        </div>
                    </div>
                );
            })}
            
            {spellChara.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    <span className="text-2xl">✨</span>
                    <p className="mt-2">Aucun sort disponible</p>
                </div>
            )}
            </div>
        </div>
    );
}