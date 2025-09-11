import { useState, useEffect } from 'react'
import { CharacterSelector } from './components/CharacterSelector'

import type { Character } from './types/Character'
import { Hotbar } from './components/Hotbar'
import { GameView } from './components/GameView'
import { useGameStore } from './store/gameStore'
import { DataManager } from './systems/DataManager'

// Initialiser DataManager au démarrage
DataManager.initialize();

function App() {
  const initializePlayer = useGameStore(state => state.initializePlayer);
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(() => {
    const saved = localStorage.getItem('selectedCharacter');
    return saved ? JSON.parse(saved) : null
  })
  
  const handleSelectCharacter = (character: Character) => {
    console.log('Personnage choisi :', character)
    setSelectedCharacter(character)
    initializePlayer(character) // ← Initialise le store avec les données du personnage
  }

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter))
      initializePlayer(selectedCharacter) // Au cas où le personnage vient du localStorage
    } else {
      localStorage.removeItem('selectedCharacter')
    }
  }, [selectedCharacter, initializePlayer]);

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      {/* Si pas de personnage, montre le sélecteur */}
      {!selectedCharacter ? (
        <CharacterSelector onSelectCharacter={handleSelectCharacter} />
      ) : (
        <>
          <Hotbar />
          <GameView character={selectedCharacter} />
        </>
      )}
    </div>
  )
}

export default App
