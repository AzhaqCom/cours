import React, { useMemo } from 'react';
import type { Scene } from '../types/Scene';
import { TextualSceneRenderer } from './scenes/TextualSceneRenderer';
import { DialogueSceneRenderer } from './scenes/DialogueSceneRenderer';
import { CombatSceneRenderer } from './scenes/CombatSceneRenderer';
import { MerchantSceneRenderer } from './scenes/MerchantSceneRenderer';
import '../styles/scene-manager.css';

export interface SceneManagerProps {
    scene: Scene;
    onSceneComplete: (choiceId?: string) => void;
    onError?: (error: string) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
    scene,
    onSceneComplete,
    onError
}) => {
    // Validation des propriétés de la scène
    const sceneValidation = useMemo(() => {
        if (!scene) {
            return { isValid: false, error: 'Aucune scène fournie' };
        }

        if (!scene.id || !scene.title || !scene.type) {
            return { 
                isValid: false, 
                error: `Scène invalide: propriétés manquantes (id: ${scene.id}, title: ${scene.title}, type: ${scene.type})` 
            };
        }

        if (!scene.choices || scene.choices.length === 0) {
            // Les scènes de combat peuvent ne pas avoir de choix immédiats
            if (scene.type !== 'COMBAT') {
                return { 
                    isValid: false, 
                    error: `Scène ${scene.id}: aucun choix disponible` 
                };
            }
        }

        return { isValid: true, error: null };
    }, [scene]);

    // Gestionnaire d'erreur unifié
    const handleError = (error: string) => {
        console.error('Erreur SceneManager:', error);
        onError?.(error);
    };

    // Gestionnaire de completion unifié avec validation
    const handleSceneComplete = (choiceId?: string) => {
        try {
            // Valider que le choix existe si fourni
            if (choiceId) {
                const choice = scene.choices.find(c => c.id === choiceId);
                if (!choice) {
                    handleError(`Choix invalide: ${choiceId} n'existe pas dans la scène ${scene.id}`);
                    return;
                }
                
                // Log pour debug
                console.log(`Scène ${scene.id} complétée avec choix:`, choice.text);
            } else {
                console.log(`Scène ${scene.id} complétée sans choix spécifique`);
            }

            onSceneComplete(choiceId);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de la completion de scène';
            handleError(errorMsg);
        }
    };

    // Afficher l'erreur de validation si nécessaire
    if (!sceneValidation.isValid) {
        return (
            <div className="scene-manager scene-manager--error">
                <div className="error-container">
                    <h2>🚨 Erreur de Scène</h2>
                    <p className="error-message">{sceneValidation.error}</p>
                    <div className="error-details">
                        <strong>Scène fournie:</strong>
                        <pre>{JSON.stringify(scene, null, 2)}</pre>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => onSceneComplete()}
                    >
                        Continuer malgré l'erreur
                    </button>
                </div>
            </div>
        );
    }

    // Router vers le bon renderer selon le type
    try {
        switch (scene.type) {
            case 'TEXTUAL':
                return (
                    <TextualSceneRenderer
                        scene={scene}
                        onSceneComplete={handleSceneComplete}
                        onError={handleError}
                    />
                );

            case 'DIALOGUE':
                return (
                    <DialogueSceneRenderer
                        scene={scene}
                        onSceneComplete={handleSceneComplete}
                    />
                );

            case 'COMBAT':
                return (
                    <CombatSceneRenderer
                        scene={scene}
                        onSceneComplete={handleSceneComplete}
                        onError={handleError}
                    />
                );

            case 'MERCHANT':
                return (
                    <MerchantSceneRenderer
                        scene={scene}
                        onSceneComplete={handleSceneComplete}
                    />
                );

            default:
                // Type de scène non reconnu
                const unknownType = (scene as any).type;
                handleError(`Type de scène non supporté: ${unknownType}`);
                
                return (
                    <div className="scene-manager scene-manager--error">
                        <div className="error-container">
                            <h2>⚠️ Type de Scène Non Supporté</h2>
                            <p className="error-message">
                                Le type de scène "{unknownType}" n'est pas encore implémenté.
                            </p>
                            <div className="supported-types">
                                <strong>Types supportés:</strong>
                                <ul>
                                    <li>TEXTUAL - Scènes narratives</li>
                                    <li>DIALOGUE - Conversations avec PNJ</li>
                                    <li>COMBAT - Combat tactique</li>
                                    <li>MERCHANT - Interface marchande</li>
                                </ul>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => onSceneComplete()}
                            >
                                Passer cette scène
                            </button>
                        </div>
                    </div>
                );
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur lors du rendu de la scène';
        handleError(errorMsg);
        
        return (
            <div className="scene-manager scene-manager--error">
                <div className="error-container">
                    <h2>💥 Erreur de Rendu</h2>
                    <p className="error-message">{errorMsg}</p>
                    <div className="error-details">
                        <strong>Scène:</strong> {scene.title} ({scene.type})
                        <br />
                        <strong>ID:</strong> {scene.id}
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => onSceneComplete()}
                    >
                        Continuer
                    </button>
                </div>
            </div>
        );
    }
};

export default SceneManager;