import type { Character } from "../types/Character";
import { starterCharacters } from "../data/characters";

interface CharacterSelectorProps {
    onSelectCharacter: (character: Character) => void;
}
export function CharacterSelector({ onSelectCharacter }: CharacterSelectorProps) {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-center mb-8">
                Choisis ton Héros
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Object.values(starterCharacters).map((character) => (
                    <div
                        key={character.name}
                        className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 cursor-pointer transition-all"
                        onClick={() => onSelectCharacter(character)}
                    >
                        <h2 className="text-2xl font-bold mb-2">{character.name}</h2>
                        <p className="text-gray-400 mb-4">{character.class}</p>

                        {/* Stats */}
                        <div className="space-y-1 text-sm">
                            <p>❤️ HP: {character.hp}/{character.maxHp}</p>
                            <p>🛡️ AC: {character.armorClass}</p>
                            <p>⚔️ Force: {character.stats.strength}</p>
                            <p>🏹 Dextérité: {character.stats.dexterity}</p>
                            <p>✨ Intelligence: {character.stats.intelligence}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}