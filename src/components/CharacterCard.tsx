import type { Character } from "../types/Character";
interface CharacterCardProps {
    character: Character;
    onBack?: () => void
}
export function CharacterCard({ character, onBack }: CharacterCardProps) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">{character.name}</h2>
            <p className="text-xl text-gray-400 mb-4">{character.class}</p>

            {/* Stats qu'on avait avant */}
            <div className="grid grid-cols-2 gap-2">
                <p>❤️ Vie: {character.hp}/{character.maxHp}</p>
                <p>🛡️ AC: {character.armorClass}</p>
                <p>⚔️ Force: {character.stats.strength}</p>
                <p>🏹 Dextérité: {character.stats.dexterity}</p>
                <p>✨ Intelligence: {character.stats.intelligence}</p>
            </div>

            {/* Bouton optionnel */}
            {onBack && (
                <button onClick={onBack} className="mt-4 bg-blue-500 px-4 py-2 rounded">
                    Retour
                </button>
            )}
        </div>
    )
}