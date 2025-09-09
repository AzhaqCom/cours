import { useState, useEffect } from 'react'
import { CharacterSelector } from './components/CharacterSelector'
import { CharacterCard } from './components/CharacterCard'
import { InventoryPanel } from './components/InventoryPanel'
import { FloatingPanel } from './components/FloatingPanel'
import type { Character } from './types/Character'
import { Hotbar } from './components/Hotbar'
function App() {
  const [showInventory, setShowInventory] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(() => {
    const saved = localStorage.getItem('selectedCharacter');
    return saved ? JSON.parse(saved) : null
  })
  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter))
    } else {
      localStorage.removeItem('selectedCharacter')
    }
  }, [selectedCharacter]);
  const handleSelectCharacter = (character: Character) => {
    console.log('Personnage choisi :', character)
    setSelectedCharacter(character)
  }
  return (
    <div>
      {/* Si pas de personnage, montre le sélecteur */}
      {!selectedCharacter ? (
        <CharacterSelector onSelectCharacter={handleSelectCharacter} />
      ) : (
        <>
          <Hotbar
            character={selectedCharacter}
            onOpenInventory={() => setShowInventory(true)}
          />

          {/* Panel d'inventaire */}
          {showInventory && (
            <FloatingPanel
              title="Inventaire"
              onClose={() => setShowInventory(false)}
            >
              <InventoryPanel character={selectedCharacter} />
            </FloatingPanel>
          )}

          <div className="pt-20">
            <CharacterCard character={selectedCharacter} onBack={() => setSelectedCharacter(null)} />
          </div>
        </>
      )}
    </div>
  )
}

export default App
