import type { Character } from '../types/Character';
import { useGameStore } from '../store/gameStore';
import { classRegistry } from '../classes';
import { SubclassSelector } from './SubclassSelector';
import { useState } from 'react';

interface LevelUpModalProps {
    character: Character;
  
}

export function LevelUpModal({ character}: LevelUpModalProps) {
    const playerLevel = useGameStore(state => state.playerLevel);
    const nextLevel = playerLevel + 1;
    const levelUp = useGameStore(state => state.levelUp);
    
    // Gestion du choix de sous-classe avec le nouveau système
    const [chosenSubclass, setChosenSubclass] = useState<string | undefined>();

    // Récupération des données via le registry
    const classDef = classRegistry.getClass(character.class);
    const progression = classRegistry.getProgression(character.class, nextLevel);
    const subclasses = classRegistry.getSubclasses(character.class);
    const canChooseSubclass = classRegistry.canChooseSubclass(character.class, nextLevel);

    // Fonction pour confirmer le level-up
    const handleConfirmLevelUp = () => {
        levelUp(character.class, chosenSubclass);
        // onClose() supprimé - le store gère maintenant l'ouverture/fermeture
    };

    if (!progression) {
        return null; // Pas de progression disponible
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-gray-800 rounded-lg border-2 border-yellow-400 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                {/* TODO: Contenu du modal */}
                <h1 className="text-4xl font-bold text-yellow-400 text-center mb-6">
                    ✨ LEVEL UP! ✨
                </h1>


                {/* Informations de progression */}
                <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-white mb-2">
                        Niveau {playerLevel} → {nextLevel}
                    </p>
                    <p className="text-gray-300">
                        Classe : {classDef?.name || character.class}
                    </p>
                </div>

                {/* Gains du niveau */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-green-400 mb-3">🎉 Nouveautés :</h3>

                    {/* HP Gain */}
                    <div className="flex justify-between mb-2">
                        <span className="text-white">❤️ Points de Vie :</span>
                        <span className="text-green-400">+{Math.ceil(progression.hitDieIncrease / 2) + 1}</span>
                    </div>

                    {/* Spell Slots si applicable */}
                    {progression.spellSlots && (
                        <div className="flex justify-between mb-2">
                            <span className="text-white">✨ Emplacements de sorts :</span>
                            <span className="text-blue-400">Nouveaux sorts disponibles</span>
                        </div>
                    )}

                    {/* Nouvelles capacités */}
                    {progression.features.length > 0 && (
                        <div className="mt-3">
                            <p className="text-purple-400 font-semibold">🔥 Nouvelles capacités :</p>
                            {progression.features.map(feature => (
                                <div key={feature.id} className="ml-4 mt-1">
                                    <p className="text-white text-sm">{feature.name}</p>
                                    <p className="text-gray-400 text-xs">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Choix de sous-classe si applicable */}
                {canChooseSubclass && subclasses.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-yellow-400 mb-3">
                            🎯 Choisissez votre spécialisation :
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            {classDef?.name} - Niveau {nextLevel}
                        </p>
                        <SubclassSelector 
                            subclasses={subclasses}
                            selectedSubclass={chosenSubclass}
                            onSelect={setChosenSubclass}
                        />
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-center">
                    <button
                        onClick={handleConfirmLevelUp}
                        disabled={canChooseSubclass && !chosenSubclass}
                        className={`font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 ${
                            canChooseSubclass && !chosenSubclass
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                    >
                        {canChooseSubclass && !chosenSubclass 
                            ? '⚠️ Choisissez une spécialisation'
                            : '🚀 CONFIRMER LE LEVEL UP !'
                        }
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
}