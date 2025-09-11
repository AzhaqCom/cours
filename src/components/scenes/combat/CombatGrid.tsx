import React, { useMemo, useCallback } from 'react';
import type { CombatState } from '../../../systems/combat';
import type { CombatEntityInstance } from '../../../types';
import type { SelectedAction, CombatPhase } from '../CombatSceneRenderer';

export interface CombatGridProps {
    combatState: CombatState;
    gridSize: { width: number; height: number };
    selectedEntity: string | null;
    selectedAction: SelectedAction | null;
    hoveredPosition: { x: number; y: number } | null;
    onCellClick: (x: number, y: number) => void;
    onCellHover: (x: number, y: number) => void;
    onCellLeave: () => void;
    config: {
        gridCellSize: number;
        colors: {
            player: string;
            companion: string;
            enemy: string;
            neutral: string;
            selected: string;
            hover: string;
            validTarget: string;
            invalidTarget: string;
        };
    };
    phase: CombatPhase;
}

export const CombatGrid: React.FC<CombatGridProps> = ({
    combatState,
    gridSize,
    selectedEntity,
    selectedAction,
    hoveredPosition,
    onCellClick,
    onCellHover,
    onCellLeave,
    config,
    phase
}) => {
    // Créer une map des positions pour un accès rapide
    const positionMap = useMemo(() => {
        const map = new Map<string, CombatEntityInstance>();
        
        combatState.entities.forEach(entity => {
            const position = combatState.grid.getEntityPosition(entity.instanceId);
            if (position) {
                const key = `${position.x},${position.y}`;
                map.set(key, entity);
            }
        });
        
        return map;
    }, [combatState]);

    // Obtenir les positions valides pour l'action sélectionnée
    const validPositions = useMemo(() => {
        if (!selectedEntity || !selectedAction) return new Set<string>();
        
        const positions = new Set<string>();
        
        switch (selectedAction.type) {
            case 'move':
                if (selectedAction.positionRequired) {
                    const entity = combatState.entities.get(selectedEntity);
                    if (entity) {
                        const currentPos = combatState.grid.getEntityPosition(selectedEntity);
                        if (currentPos) {
                            const accessible = combatState.grid.getAccessiblePositions(currentPos, entity.entity.movement);
                            accessible.forEach(pos => {
                                positions.add(`${pos.x},${pos.y}`);
                            });
                        }
                    }
                }
                break;
                
            case 'attack':
                if (selectedAction.targetRequired) {
                    const entity = combatState.entities.get(selectedEntity);
                    if (entity) {
                        const currentPos = combatState.grid.getEntityPosition(selectedEntity);
                        if (currentPos) {
                            // TODO: Utiliser la vraie portée d'arme
                            const range = entity.entity.weaponIds.some(w => w.includes('bow') || w.includes('crossbow')) ? 6 : 1;
                            
                            for (let x = Math.max(0, currentPos.x - range); x <= Math.min(gridSize.width - 1, currentPos.x + range); x++) {
                                for (let y = Math.max(0, currentPos.y - range); y <= Math.min(gridSize.height - 1, currentPos.y + range); y++) {
                                    const distance = combatState.grid.getDistance(currentPos, { x, y });
                                    if (distance <= range) {
                                        positions.add(`${x},${y}`);
                                    }
                                }
                            }
                        }
                    }
                }
                break;
                
            case 'cast':
                // TODO: Implémenter selon le sort sélectionné
                break;
        }
        
        return positions;
    }, [selectedEntity, selectedAction, combatState, gridSize]);

    // Déterminer la couleur d'une cellule
    const getCellColor = useCallback((x: number, y: number): string => {
        const key = `${x},${y}`;
        const entity = positionMap.get(key);
        
        // Entité sélectionnée
        if (entity && entity.instanceId === selectedEntity) {
            return config.colors.selected;
        }
        
        // Position survolée
        if (hoveredPosition && hoveredPosition.x === x && hoveredPosition.y === y) {
            return config.colors.hover;
        }
        
        // Position valide pour l'action
        if (selectedAction && validPositions.has(key)) {
            // Vérifier s'il y a une cible valide à cette position
            if (selectedAction.targetRequired && entity) {
                const isValidTarget = isValidTargetForAction(entity, selectedAction, selectedEntity, combatState);
                return isValidTarget ? config.colors.validTarget : config.colors.invalidTarget;
            }
            return config.colors.validTarget;
        }
        
        // Couleur de l'entité
        if (entity) {
            if (combatState.playerEntities.includes(entity.instanceId)) {
                return config.colors.player;
            } else if (combatState.companionEntities.includes(entity.instanceId)) {
                return config.colors.companion;
            } else if (combatState.enemyEntities.includes(entity.instanceId)) {
                return config.colors.enemy;
            }
        }
        
        return config.colors.neutral;
    }, [positionMap, selectedEntity, hoveredPosition, selectedAction, validPositions, config.colors, combatState]);

    // Déterminer le contenu d'une cellule
    const getCellContent = useCallback((x: number, y: number): React.ReactNode => {
        const key = `${x},${y}`;
        const entity = positionMap.get(key);
        
        if (!entity) return null;
        
        const healthPercent = (entity.currentHp / entity.entity.maxHp) * 100;
        const isAlive = entity.isAlive;
        
        return (
            <div className="cell-entity">
                <div className="entity-icon">
                    {entity.entity.name.charAt(0).toUpperCase()}
                </div>
                <div className="entity-health">
                    <div 
                        className="health-bar"
                        style={{ width: `${healthPercent}%` }}
                    />
                </div>
                <div className="entity-name">
                    {entity.entity.name}
                </div>
                {!isAlive && (
                    <div className="entity-status-ko">KO</div>
                )}
                {entity.hasActed && (
                    <div className="entity-status-acted">✓</div>
                )}
            </div>
        );
    }, [positionMap]);

    // Gestionnaire de clic sur cellule
    const handleCellClick = useCallback((x: number, y: number) => {
        if (phase !== 'combat') return;
        onCellClick(x, y);
    }, [phase, onCellClick]);

    // Rendu de la grille
    const renderGrid = () => {
        const cells = [];
        
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const color = getCellColor(x, y);
                const content = getCellContent(x, y);
                const isClickable = phase === 'combat';
                
                cells.push(
                    <div
                        key={`${x}-${y}`}
                        className={`grid-cell ${isClickable ? 'grid-cell--clickable' : ''}`}
                        style={{
                            backgroundColor: color,
                            width: config.gridCellSize,
                            height: config.gridCellSize,
                            left: x * config.gridCellSize,
                            top: y * config.gridCellSize
                        }}
                        onClick={() => handleCellClick(x, y)}
                        onMouseEnter={() => onCellHover(x, y)}
                        onMouseLeave={onCellLeave}
                        data-x={x}
                        data-y={y}
                    >
                        <div className="cell-coords">
                            {x},{y}
                        </div>
                        {content}
                    </div>
                );
            }
        }
        
        return cells;
    };

    return (
        <div 
            className="combat-grid"
            style={{
                width: gridSize.width * config.gridCellSize,
                height: gridSize.height * config.gridCellSize,
                position: 'relative'
            }}
        >
            {renderGrid()}
            
            {/* Overlay pour les actions */}
            {selectedAction && (
                <div className="grid-overlay">
                    <div className="action-indicator">
                        Action: {selectedAction.type}
                        {selectedAction.targetRequired && " - Sélectionnez une cible"}
                        {selectedAction.positionRequired && " - Sélectionnez une position"}
                    </div>
                </div>
            )}
        </div>
    );
};

// Fonction utilitaire pour vérifier si une cible est valide pour une action
function isValidTargetForAction(
    target: CombatEntityInstance, 
    action: SelectedAction, 
    actorId: string | null, 
    combatState: CombatState
): boolean {
    if (!actorId) return false;
    
    switch (action.type) {
        case 'attack':
            // Peut attaquer les ennemis uniquement
            return combatState.enemyEntities.includes(target.instanceId) && target.isAlive;
            
        case 'cast':
            // Dépend du sort - pour le moment, permet alliés et ennemis
            return target.isAlive;
            
        default:
            return false;
    }
}

export default CombatGrid;