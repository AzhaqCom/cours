import type { Character } from '../types/Character';
import { useGameStore } from '../store/gameStore';

interface InventoryPanelProps {
    character: Character;
}

export function InventoryPanel({ character }: InventoryPanelProps) {
    const playerInventory = useGameStore(state => state.playerInventory);
    
    // Combine inventaire du personnage + inventaire dynamique du store
    const allItems = [...character.inventory, ...playerInventory];
    
    return (
        <div>
            <h4 className="text-lg font-bold mb-3">🎒 Inventaire</h4>

            {allItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <span className="text-2xl">📦</span>
                    <p className="mt-2">Inventaire vide</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {character.inventory.map((item, index) => (
                        <div key={`base-${index}`} className="bg-gray-700 p-3 rounded-lg border-l-2 border-blue-500">
                            <p className="font-medium text-white">{item}</p>
                            <p className="text-xs text-blue-300">Équipement de base</p>
                        </div>
                    ))}
                    {playerInventory.map((item, index) => (
                        <div key={`dynamic-${index}`} className="bg-gray-700 p-3 rounded-lg border-l-2 border-green-500">
                            <p className="font-medium text-white">{item}</p>
                            <p className="text-xs text-green-300">Objet trouvé</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-600">
                <p className="text-sm text-gray-400">
                    📦 {allItems.length} objets au total
                </p>
                <div className="text-xs text-gray-500 mt-1">
                    {character.inventory.length > 0 && <span>⚔️ {character.inventory.length} base</span>}
                    {playerInventory.length > 0 && <span className="ml-2">🎁 {playerInventory.length} trouvés</span>}
                </div>
            </div>
        </div>
    );
}