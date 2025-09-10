import React, { useState, useEffect, useCallback } from 'react';
import type { CombatScene } from '../../types/Scene';
import type { CombatEntityInstance } from '../../types/CombatEntity';
import { CombatGrid } from './combat/CombatGrid';
import { CombatUI } from './combat/CombatUI';
import { CombatActionModal } from './combat/CombatActionModal';
import { useCombat } from '../../hooks/useCombat';
import './combat/CombatScene.css';

// Types pour l'interface
export type CombatPhase = 'setup' | 'combat' | 'victory' | 'defeat' | 'paused';

export type SelectedAction = {
    type: 'move' | 'attack' | 'cast' | 'defend' | 'end_turn';
    targetRequired?: boolean;
    positionRequired?: boolean;
};

export interface CombatSceneRendererProps {
    scene: CombatScene;
    onSceneComplete: (choiceId?: string) => void;
    onError?: (error: string) => void;
}

// Configuration pour l'affichage
const COMBAT_CONFIG = {
    gridCellSize: 48, // pixels
    animationDuration: 300, // ms
    turnIndicatorDuration: 1000, // ms
    maxGridSize: { width: 12, height: 8 },
    colors: {
        player: '#4CAF50',
        companion: '#2196F3', 
        enemy: '#F44336',
        neutral: '#9E9E9E',
        selected: '#FFC107',
        hover: '#FF9800',
        validTarget: '#8BC34A',
        invalidTarget: '#FF5722'
    }
};

export const CombatSceneRenderer: React.FC<CombatSceneRendererProps> = ({
    scene,
    onSceneComplete,
    onError
}) => {
    // État du combat
    const [phase, setPhase] = useState<CombatPhase>('setup');
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
    const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [combatLog, setCombatLog] = useState<string[]>([]);

    // Hook personnalisé pour la logique de combat
    const {
        combatState,
        companionAI,
        initializeCombat,
        executePlayerAction,
        advanceTurn,
        isPlayerTurn,
        getCurrentEntity,
        getValidActions
    } = useCombat();

    // Initialisation du combat
    useEffect(() => {
        const initAsync = async () => {
            try {
                setPhase('setup');
                addToCombatLog('Initialisation du combat...');
                
                const success = await initializeCombat(scene);
                if (success) {
                    setPhase('combat');
                    addToCombatLog('Combat commencé !');
                } else {
                    throw new Error('Échec de l\'initialisation du combat');
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
                onError?.(errorMsg);
                addToCombatLog(`Erreur : ${errorMsg}`);
            }
        };

        initAsync();
    }, [scene, initializeCombat, onError]);

    // Vérification des conditions de victoire/défaite
    useEffect(() => {
        if (!combatState || phase !== 'combat') return;

        const checkEndConditions = () => {
            const aliveEnemies = combatState.enemyEntities.filter(id => {
                const entity = combatState.entities.get(id);
                return entity && entity.isAlive;
            });

            const aliveAllies = [...combatState.playerEntities, ...combatState.companionEntities].filter(id => {
                const entity = combatState.entities.get(id);
                return entity && entity.isAlive;
            });

            if (aliveEnemies.length === 0) {
                setPhase('victory');
                addToCombatLog('🎉 Victoire !');
                setTimeout(() => {
                    onSceneComplete(scene.choices?.[0]?.id);
                }, 2000);
            } else if (aliveAllies.length === 0) {
                setPhase('defeat');
                addToCombatLog('💀 Défaite...');
                setTimeout(() => {
                    onSceneComplete(); // Game over ou retry
                }, 2000);
            }
        };

        checkEndConditions();
    }, [combatState, phase, scene.choices, onSceneComplete]);

    // Gestion du tour des compagnons et ennemis
    useEffect(() => {
        if (!combatState || phase !== 'combat' || isPlayerTurn()) return;

        const handleAITurn = async () => {
            const currentEntity = getCurrentEntity();
            if (!currentEntity) return;

            addToCombatLog(`Tour de ${currentEntity.entity.name}...`);

            try {
                // Délai pour l'immersion
                await new Promise(resolve => setTimeout(resolve, 500));

                if (combatState.companionEntities.includes(currentEntity.instanceId)) {
                    // Tour de compagnon
                    if (companionAI) {
                        const decision = companionAI.decideForCompanion(currentEntity, combatState);
                        await executeAIAction(currentEntity, decision);
                    } else {
                        addToCombatLog(`${currentEntity.entity.name} passe son tour (IA non disponible)`);
                        advanceTurn();
                    }
                } else {
                    // Tour d'ennemi (utilise AICore directement)
                    // TODO: Implémenter quand on aura les données d'ennemis
                    addToCombatLog(`${currentEntity.entity.name} passe son tour`);
                    advanceTurn();
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Erreur IA';
                addToCombatLog(`Erreur IA : ${errorMsg}`);
                advanceTurn(); // Passer le tour en cas d'erreur
            }
        };

        handleAITurn();
    }, [combatState, phase, isPlayerTurn, getCurrentEntity, companionAI, advanceTurn]);

    // Fonctions utilitaires
    const addToCombatLog = useCallback((message: string) => {
        setCombatLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    }, []);

    const executeAIAction = async (entity: CombatEntityInstance, decision: any) => {
        // TODO: Convertir AIDecision en Action et exécuter
        addToCombatLog(`${entity.entity.name} utilise ${decision.action}`);
        advanceTurn();
    };

    // Gestionnaires d'événements
    const handleCellClick = useCallback((x: number, y: number) => {
        if (phase !== 'combat' || !isPlayerTurn()) return;

        const currentEntity = getCurrentEntity();
        if (!currentEntity) return;

        // Si on a une action sélectionnée
        if (selectedAction) {
            handleActionTarget(x, y);
            return;
        }

        // Sélectionner une entité à cette position
        const entityAtPosition = Array.from(combatState!.entities.values())
            .find(e => {
                const pos = combatState!.grid.getEntityPosition(e.instanceId);
                return pos && pos.x === x && pos.y === y;
            });

        if (entityAtPosition) {
            // Si c'est une entité du joueur ou un compagnon
            if (combatState!.playerEntities.includes(entityAtPosition.instanceId) || 
                combatState!.companionEntities.includes(entityAtPosition.instanceId)) {
                setSelectedEntity(entityAtPosition.instanceId);
                setActionModalOpen(true);
            }
        }
    }, [phase, isPlayerTurn, getCurrentEntity, selectedAction, combatState]);

    const handleActionTarget = useCallback(async (x: number, y: number) => {
        if (!selectedAction || !selectedEntity || !combatState) return;

        const currentEntity = getCurrentEntity();
        if (!currentEntity || currentEntity.instanceId !== selectedEntity) return;

        try {
            let success = false;

            switch (selectedAction.type) {
                case 'move':
                    success = await executePlayerAction({
                        type: 'move',
                        actorId: selectedEntity,
                        targetPosition: { x, y }
                    });
                    break;

                case 'attack':
                    const targetEntity = Array.from(combatState.entities.values())
                        .find(e => {
                            const pos = combatState.grid.getEntityPosition(e.instanceId);
                            return pos && pos.x === x && pos.y === y;
                        });
                    
                    if (targetEntity) {
                        success = await executePlayerAction({
                            type: 'attack',
                            actorId: selectedEntity,
                            weaponId: currentEntity.entity.weaponIds[0], // Première arme
                            targetId: targetEntity.instanceId
                        });
                    }
                    break;

                case 'cast':
                    // TODO: Implémenter quand on aura l'UI de sélection de sorts
                    break;
            }

            if (success) {
                addToCombatLog(`Action ${selectedAction.type} exécutée`);
                setSelectedAction(null);
                setSelectedEntity(null);
                
                // Le tour avance automatiquement après une action réussie
                if (selectedAction.type !== 'move') {
                    advanceTurn();
                }
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur d\'action';
            addToCombatLog(`Erreur : ${errorMsg}`);
        }
    }, [selectedAction, selectedEntity, combatState, getCurrentEntity, executePlayerAction, advanceTurn, addToCombatLog]);

    const handleActionSelect = useCallback((action: SelectedAction) => {
        setSelectedAction(action);
        setActionModalOpen(false);

        if (action.type === 'end_turn') {
            advanceTurn();
            setSelectedEntity(null);
        } else if (action.type === 'defend') {
            // Exécution immédiate pour defend
            executePlayerAction({
                type: 'defend',
                actorId: selectedEntity!
            }).then(() => {
                advanceTurn();
                setSelectedEntity(null);
                setSelectedAction(null);
            });
        }

        addToCombatLog(`Action ${action.type} sélectionnée`);
    }, [selectedEntity, executePlayerAction, advanceTurn, addToCombatLog]);

    const handleCellHover = useCallback((x: number, y: number) => {
        setHoveredPosition({ x, y });
    }, []);

    const handleCellLeave = useCallback(() => {
        setHoveredPosition(null);
    }, []);

    // Rendu
    if (phase === 'setup') {
        return (
            <div className="combat-scene combat-scene--loading">
                <div className="combat-loading">
                    <div className="combat-loading__spinner"></div>
                    <p>Initialisation du combat...</p>
                </div>
            </div>
        );
    }

    if (!combatState) {
        return (
            <div className="combat-scene combat-scene--error">
                <p>Erreur : État de combat non disponible</p>
            </div>
        );
    }

    return (
        <div className={`combat-scene combat-scene--${phase}`}>
            {/* Description pré-combat */}
            {scene.description && phase === 'combat' && (
                <div className="combat-description">
                    <p>{scene.description}</p>
                </div>
            )}

            {/* Interface principale */}
            <div className="combat-main">
                {/* Grille de combat */}
                <div className="combat-grid-container">
                    <CombatGrid
                        combatState={combatState}
                        gridSize={scene.combat.gridSize}
                        selectedEntity={selectedEntity}
                        selectedAction={selectedAction}
                        hoveredPosition={hoveredPosition}
                        onCellClick={handleCellClick}
                        onCellHover={handleCellHover}
                        onCellLeave={handleCellLeave}
                        config={COMBAT_CONFIG}
                        phase={phase}
                    />
                </div>

                {/* Interface utilisateur */}
                <div className="combat-ui-container">
                    <CombatUI
                        combatState={combatState}
                        currentEntity={getCurrentEntity()}
                        isPlayerTurn={isPlayerTurn()}
                        selectedEntity={selectedEntity}
                        selectedAction={selectedAction}
                        onActionCancel={() => {
                            setSelectedAction(null);
                            setSelectedEntity(null);
                        }}
                        combatLog={combatLog}
                        phase={phase}
                        config={COMBAT_CONFIG}
                    />
                </div>
            </div>

            {/* Modal de sélection d'actions */}
            {actionModalOpen && selectedEntity && (
                <CombatActionModal
                    entity={combatState.entities.get(selectedEntity)!}
                    availableActions={getValidActions(selectedEntity)}
                    onActionSelect={handleActionSelect}
                    onClose={() => setActionModalOpen(false)}
                />
            )}

            {/* Overlays pour les phases spéciales */}
            {phase === 'victory' && (
                <div className="combat-overlay combat-overlay--victory">
                    <div className="combat-result">
                        <h2>🎉 Victoire !</h2>
                        <p>Vous avez triomphé de vos ennemis !</p>
                    </div>
                </div>
            )}

            {phase === 'defeat' && (
                <div className="combat-overlay combat-overlay--defeat">
                    <div className="combat-result">
                        <h2>💀 Défaite</h2>
                        <p>Vos forces ont été anéanties...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatSceneRenderer;