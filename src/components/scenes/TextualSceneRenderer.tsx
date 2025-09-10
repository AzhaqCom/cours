import React, { useState, useCallback } from 'react';
import type { TextualScene } from '../../types/Scene';
import './textual/TextualScene.css';

export interface TextualSceneRendererProps {
    scene: TextualScene;
    onSceneComplete: (choiceId?: string) => void;
    onError?: (error: string) => void;
}

export const TextualSceneRenderer: React.FC<TextualSceneRendererProps> = ({
    scene,
    onSceneComplete
}) => {
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

    // Gestionnaire de sélection de choix
    const handleChoiceSelect = useCallback((choiceId: string) => {
        if (selectedChoiceId === choiceId) {
            // Double clic ou confirmation
            onSceneComplete(choiceId);
        } else {
            // Premier clic - sélectionner
            setSelectedChoiceId(choiceId);
        }
    }, [selectedChoiceId, onSceneComplete]);

    // Navigation clavier
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedChoiceId(prevId => {
                    const currentIndex = scene.choices.findIndex(c => c.id === prevId);
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : scene.choices.length - 1;
                    return scene.choices[newIndex].id;
                });
                break;

            case 'ArrowDown':
                event.preventDefault();
                setSelectedChoiceId(prevId => {
                    const currentIndex = scene.choices.findIndex(c => c.id === prevId);
                    const newIndex = currentIndex < scene.choices.length - 1 ? currentIndex + 1 : 0;
                    return scene.choices[newIndex].id;
                });
                break;

            case 'Enter':
                event.preventDefault();
                if (selectedChoiceId) {
                    onSceneComplete(selectedChoiceId);
                }
                break;

            case 'Escape':
                event.preventDefault();
                setSelectedChoiceId(null);
                break;

            // Raccourcis numériques
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                event.preventDefault();
                const choiceIndex = parseInt(event.key) - 1;
                if (choiceIndex < scene.choices.length) {
                    const choice = scene.choices[choiceIndex];
                    onSceneComplete(choice.id);
                }
                break;
        }
    }, [scene.choices, selectedChoiceId, onSceneComplete]);

    // Auto-sélection du premier choix si aucun n'est sélectionné
    React.useEffect(() => {
        if (!selectedChoiceId && scene.choices.length > 0) {
            setSelectedChoiceId(scene.choices[0].id);
        }
    }, [selectedChoiceId, scene.choices]);

    return (
        <div 
            className="textual-scene"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Titre de la scène */}
            <div className="scene-header">
                <h1 className="scene-title">{scene.title}</h1>
            </div>

            {/* Description narrative */}
            <div className="scene-content">
                <div className="narrative-text">
                    <p>{scene.description}</p>
                </div>
            </div>

            {/* Choix disponibles */}
            <div className="scene-choices">
                <div className="choices-header">
                    <h3>Que faites-vous ?</h3>
                    <div className="choices-instructions">
                        Utilisez ↑↓ ou cliquez • Entrée pour confirmer • 1-9 pour sélection directe
                    </div>
                </div>
                
                <div className="choices-list">
                    {scene.choices.map((choice, index) => {
                        const isSelected = selectedChoiceId === choice.id;
                        const isDisabled = choice.requirements && !checkRequirements(choice.requirements);
                        
                        return (
                            <button
                                key={choice.id}
                                className={`choice-button ${isSelected ? 'choice-button--selected' : ''} ${isDisabled ? 'choice-button--disabled' : ''}`}
                                onClick={() => !isDisabled && handleChoiceSelect(choice.id)}
                                disabled={isDisabled}
                                data-index={index + 1}
                            >
                                <div className="choice-number">
                                    {index + 1}
                                </div>
                                <div className="choice-content">
                                    <div className="choice-text">
                                        {choice.text}
                                    </div>
                                    {choice.requirements && (
                                        <div className="choice-requirements">
                                            {formatRequirements(choice.requirements)}
                                        </div>
                                    )}
                                    {choice.consequences && (
                                        <div className="choice-consequences">
                                            {formatConsequences(choice.consequences)}
                                        </div>
                                    )}
                                </div>
                                {isSelected && (
                                    <div className="choice-indicator">
                                        →
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Confirmation */}
                {selectedChoiceId && (
                    <div className="choice-confirmation">
                        <span>
                            Appuyez sur <kbd>Entrée</kbd> ou cliquez à nouveau pour confirmer
                        </span>
                    </div>
                )}
            </div>

            {/* Interface d'aide */}
            <div className="scene-help">
                <div className="help-controls">
                    <div className="control-group">
                        <span className="control-label">Navigation:</span>
                        <kbd>↑</kbd><kbd>↓</kbd> ou <kbd>1-9</kbd>
                    </div>
                    <div className="control-group">
                        <span className="control-label">Confirmer:</span>
                        <kbd>Entrée</kbd> ou double-clic
                    </div>
                </div>
            </div>
        </div>
    );
};

// Fonctions utilitaires (TODO: intégrer avec le vrai système)
function checkRequirements(_requirements: any): boolean {
    return true;
}

function formatRequirements(_requirements: any): string {
    return 'Requis: À implémenter';
}

function formatConsequences(consequences: any): string {
    const parts: string[] = [];
    
    if (consequences.xp) {
        parts.push(`+${consequences.xp} XP`);
    }
    if (consequences.gold) {
        parts.push(`+${consequences.gold} or`);
    }
    if (consequences.items && consequences.items.length > 0) {
        parts.push(`Items: ${consequences.items.join(', ')}`);
    }
    if (consequences.damage) {
        parts.push(`-${consequences.damage} HP`);
    }
    if (consequences.heal) {
        parts.push(`+${consequences.heal} HP`);
    }
    
    return parts.join(' • ');
}

export default TextualSceneRenderer;