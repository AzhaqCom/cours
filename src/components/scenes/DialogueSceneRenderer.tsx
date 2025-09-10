import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DialogueScene, Choice } from '../../types/Scene';
import './dialogue/DialogueScene.css';

export interface DialogueSceneRendererProps {
    scene: DialogueScene;
    onSceneComplete: (choiceId?: string) => void;
    onError?: (error: string) => void;
}

export const DialogueSceneRenderer: React.FC<DialogueSceneRendererProps> = ({
    scene,
    onSceneComplete
}) => {
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [currentText, setCurrentText] = useState('');
    const [showChoices, setShowChoices] = useState(false);

    // Configuration du typewriter
    const typewriterConfig = {
        speed: 30, // ms per character
        enabled: true
    };

    // Animation du texte (typewriter effect)
    useEffect(() => {
        if (!typewriterConfig.enabled) {
            setCurrentText(scene.npc.dialogue);
            setShowChoices(true);
            return;
        }

        setIsTyping(true);
        setCurrentText('');
        setShowChoices(false);

        let index = 0;
        const text = scene.npc.dialogue;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setCurrentText(text.substring(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                setShowChoices(true);
                clearInterval(typeInterval);
            }
        }, typewriterConfig.speed);

        return () => clearInterval(typeInterval);
    }, [scene.npc.dialogue]);

    // Filtrer les choix selon les requirements
    const availableChoices = useMemo(() => {
        return scene.choices.filter(choice => {
            if (!choice.requirements) return true;
            
            // TODO: Intégrer avec le système de requirements
            // Pour le moment, tous les choix sont disponibles
            return true;
        });
    }, [scene.choices]);

    // Gestionnaire de clic sur choix
    const handleChoiceClick = useCallback((choice: Choice) => {
        if (selectedChoiceId === choice.id) {
            // Double clic ou confirmation - exécuter le choix
            onSceneComplete(choice.id);
        } else {
            // Premier clic - sélectionner
            setSelectedChoiceId(choice.id);
        }
    }, [selectedChoiceId, onSceneComplete]);

    // Gestionnaire de touche pour naviguer
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!showChoices || availableChoices.length === 0) return;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedChoiceId(prevId => {
                    const currentIndex = availableChoices.findIndex(c => c.id === prevId);
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : availableChoices.length - 1;
                    return availableChoices[newIndex].id;
                });
                break;

            case 'ArrowDown':
                event.preventDefault();
                setSelectedChoiceId(prevId => {
                    const currentIndex = availableChoices.findIndex(c => c.id === prevId);
                    const newIndex = currentIndex < availableChoices.length - 1 ? currentIndex + 1 : 0;
                    return availableChoices[newIndex].id;
                });
                break;

            case 'Enter':
                event.preventDefault();
                if (selectedChoiceId) {
                    const selectedChoice = availableChoices.find(c => c.id === selectedChoiceId);
                    if (selectedChoice) {
                        onSceneComplete(selectedChoice.id);
                    }
                }
                break;

            case 'Escape':
                event.preventDefault();
                setSelectedChoiceId(null);
                break;

            // Raccourcis numériques (1-9)
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
                if (choiceIndex < availableChoices.length) {
                    const choice = availableChoices[choiceIndex];
                    onSceneComplete(choice.id);
                }
                break;
        }
    }, [showChoices, availableChoices, selectedChoiceId, onSceneComplete]);

    // Attacher les event listeners pour les touches
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Auto-sélection du premier choix
    useEffect(() => {
        if (showChoices && availableChoices.length > 0 && !selectedChoiceId) {
            setSelectedChoiceId(availableChoices[0].id);
        }
    }, [showChoices, availableChoices, selectedChoiceId]);

    // Raccourcir le dialogue si trop long (pour éviter le overflow)
    const skipTypewriter = useCallback(() => {
        if (isTyping) {
            setCurrentText(scene.npc.dialogue);
            setIsTyping(false);
            setShowChoices(true);
        }
    }, [isTyping, scene.npc.dialogue]);

    // Rendre un choix
    const renderChoice = useCallback((choice: Choice, index: number) => {
        const isSelected = selectedChoiceId === choice.id;
        const isDisabled = choice.requirements && !checkRequirements(choice.requirements);
        
        return (
            <button
                key={choice.id}
                className={`dialogue-choice ${isSelected ? 'dialogue-choice--selected' : ''} ${isDisabled ? 'dialogue-choice--disabled' : ''}`}
                onClick={() => !isDisabled && handleChoiceClick(choice)}
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
    }, [selectedChoiceId, handleChoiceClick]);

    return (
        <div className="dialogue-scene">
            {/* Description contextuelle */}
            {scene.description && (
                <div className="dialogue-context">
                    <p>{scene.description}</p>
                </div>
            )}

            {/* Interface principale */}
            <div className="dialogue-main">
                {/* Portrait du PNJ */}
                <div className="dialogue-npc">
                    <div className="npc-portrait">
                        {scene.npc.portrait ? (
                            <img 
                                src={scene.npc.portrait} 
                                alt={scene.npc.name}
                                className="portrait-image"
                            />
                        ) : (
                            <div className="portrait-placeholder">
                                {scene.npc.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="npc-name">
                        {scene.npc.name}
                    </div>
                </div>

                {/* Boîte de dialogue */}
                <div className="dialogue-box">
                    <div 
                        className="dialogue-text"
                        onClick={skipTypewriter}
                    >
                        {currentText}
                        {isTyping && (
                            <span className="typing-cursor">|</span>
                        )}
                    </div>

                    {/* Indicateur de progression */}
                    {isTyping && (
                        <div className="typing-progress">
                            <div 
                                className="progress-bar"
                                style={{
                                    width: `${(currentText.length / scene.npc.dialogue.length) * 100}%`
                                }}
                            />
                        </div>
                    )}

                    {/* Instruction pour passer */}
                    {isTyping && (
                        <div className="dialogue-instruction">
                            Cliquez pour terminer...
                        </div>
                    )}
                </div>
            </div>

            {/* Choix */}
            {showChoices && (
                <div className="dialogue-choices">
                    <div className="choices-header">
                        <h4>Que répondez-vous ?</h4>
                        <div className="choices-instructions">
                            <span>Utilisez ↑↓ ou cliquez • Entrée pour confirmer • 1-9 pour sélection directe</span>
                        </div>
                    </div>
                    
                    <div className="choices-list">
                        {availableChoices.map((choice, index) => renderChoice(choice, index))}
                    </div>

                    {selectedChoiceId && (
                        <div className="choice-confirmation">
                            <span>
                                Appuyez sur <kbd>Entrée</kbd> ou cliquez à nouveau pour confirmer
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Interface d'aide */}
            <div className="dialogue-help">
                <div className="help-controls">
                    <div className="control-group">
                        <span className="control-label">Navigation:</span>
                        <kbd>↑</kbd><kbd>↓</kbd> ou <kbd>1-9</kbd>
                    </div>
                    <div className="control-group">
                        <span className="control-label">Confirmer:</span>
                        <kbd>Entrée</kbd> ou double-clic
                    </div>
                    <div className="control-group">
                        <span className="control-label">Passer le texte:</span>
                        <kbd>Clic</kbd>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Fonctions utilitaires
function checkRequirements(_requirements: any): boolean {
    // TODO: Intégrer avec le système de requirements
    // Pour le moment, toujours true
    return true;
}

function formatRequirements(_requirements: any): string {
    // TODO: Formatter les requirements pour affichage
    return 'Requis: À implémenter';
}

function formatConsequences(consequences: any): string {
    // TODO: Formatter les conséquences pour aperçu
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

export default DialogueSceneRenderer;