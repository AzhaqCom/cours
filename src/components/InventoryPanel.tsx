import type { Character } from '../types/Character';

  interface InventoryPanelProps {
    character: Character;
  }

  export function InventoryPanel({ character }: InventoryPanelProps) {
    return (
      <div>
        <h4 className="text-lg font-bold mb-3">🎒 Inventaire</h4>

        {character.inventory.length === 0 ? (
          <p className="text-gray-400">Inventaire vide</p>
        ) : (
          <div className="space-y-2">
            {character.inventory.map((item, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded">
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-sm text-gray-400">
            📦 {character.inventory.length} objets
          </p>
        </div>
      </div>
    );
  }