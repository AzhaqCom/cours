import React, { useMemo } from 'react';
import type { CombatState } from '../../../systems/combat/CombatManager';
import type { CombatEntityInstance } from '../../../types/CombatEntity';
import type { SelectedAction, CombatPhase } from '../CombatSceneRenderer';

export interface CombatUIProps {
    combatState: CombatState;
    currentEntity: CombatEntityInstance | null;
    isPlayerTurn: boolean;
    selectedEntity: string | null;
    selectedAction: SelectedAction | null;
    onActionCancel: () => void;
    combatLog: string[];
    phase: CombatPhase;
    config: {
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
}

export const CombatUI: React.FC<CombatUIProps> = ({
    combatState,
    currentEntity,
    isPlayerTurn,
    selectedEntity,
    selectedAction,
    onActionCancel,
    combatLog,
    phase,
    config
}) => {
    // Organiser les entités par type
    const organizedEntities = useMemo(() => {
        const players: CombatEntityInstance[] = [];
        const companions: CombatEntityInstance[] = [];
        const enemies: CombatEntityInstance[] = [];

        combatState.entities.forEach(entity => {
            if (combatState.playerEntities.includes(entity.instanceId)) {
                players.push(entity);
            } else if (combatState.companionEntities.includes(entity.instanceId)) {
                companions.push(entity);
            } else if (combatState.enemyEntities.includes(entity.instanceId)) {
                enemies.push(entity);
            }
        });

        return { players, companions, enemies };
    }, [combatState]);

    // Calculer les statistiques du combat
    const combatStats = useMemo(() => {
        const aliveAllies = [...organizedEntities.players, ...organizedEntities.companions]
            .filter(e => e.isAlive).length;
        const totalAllies = organizedEntities.players.length + organizedEntities.companions.length;
        
        const aliveEnemies = organizedEntities.enemies.filter(e => e.isAlive).length;
        const totalEnemies = organizedEntities.enemies.length;
        
        const currentTurnEntity = combatState.initiative.getCurrentTurn();
        const currentRound = combatState.initiative.getCurrentRound();

        return {
            aliveAllies,
            totalAllies,
            aliveEnemies,
            totalEnemies,
            currentTurn: currentTurnEntity?.instanceId || '',
            round: currentRound
        };
    }, [organizedEntities, combatState]);

    // Rendu d'une entité
    const renderEntity = (entity: CombatEntityInstance, entityType: 'player' | 'companion' | 'enemy') => {
        const healthPercent = (entity.currentHp / entity.entity.maxHp) * 100;
        const isSelected = selectedEntity === entity.instanceId;
        const isCurrent = currentEntity?.instanceId === entity.instanceId;
        
        let typeColor = config.colors.neutral;
        switch (entityType) {
            case 'player':
                typeColor = config.colors.player;
                break;
            case 'companion':
                typeColor = config.colors.companion;
                break;
            case 'enemy':
                typeColor = config.colors.enemy;
                break;
        }

        return (
            <div 
                key={entity.instanceId}
                className={`entity-card ${isSelected ? 'entity-card--selected' : ''} ${isCurrent ? 'entity-card--current' : ''} ${!entity.isAlive ? 'entity-card--ko' : ''}`}
                style={{ borderLeftColor: typeColor }}
            >
                <div className="entity-header">
                    <div className="entity-name">
                        {entity.entity.name}
                        {isCurrent && <span className="current-indicator">⭐</span>}
                    </div>
                    <div className="entity-level">
                        Niv. {entity.entity.level || 1}
                    </div>
                </div>
                
                <div className="entity-health">
                    <div className="health-label">
                        HP: {entity.currentHp}/{entity.entity.maxHp}
                    </div>
                    <div className="health-bar-container">
                        <div 
                            className="health-bar"
                            style={{ 
                                width: `${healthPercent}%`,
                                backgroundColor: healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FF9800' : '#F44336'
                            }}
                        />
                    </div>
                </div>

                <div className="entity-stats">
                    <span>CA: {entity.entity.ac}</span>
                    <span>Mouv: {entity.entity.movement}</span>
                </div>

                <div className="entity-status">
                    {!entity.isAlive && (
                        <span className="status-ko">K.O.</span>
                    )}
                    {entity.hasActed && entity.isAlive && (
                        <span className="status-acted">Action effectuée</span>
                    )}
                    {entity.hasMoved && entity.isAlive && !entity.hasActed && (
                        <span className="status-moved">A bougé</span>
                    )}
                </div>

                {/* Position actuelle */}
                <div className="entity-position">
                    {(() => {
                        const pos = combatState.grid.getEntityPosition(entity.instanceId);
                        return pos ? `Position: (${pos.x}, ${pos.y})` : 'Position inconnue';
                    })()}
                </div>
            </div>
        );
    };

    return (
        <div className="combat-ui">
            {/* Informations du tour */}
            <div className="turn-info">
                <div className="turn-header">
                    <h3>Round {combatStats.round} - Tour {combatStats.currentTurn + 1}</h3>
                    <div className="phase-indicator">
                        Phase: {phase}
                    </div>
                </div>
                
                {currentEntity && (
                    <div className="current-turn">
                        <strong>Tour de: {currentEntity.entity.name}</strong>
                        {isPlayerTurn && (
                            <span className="player-turn-indicator">⚡ Votre tour</span>
                        )}
                    </div>
                )}

                <div className="combat-stats">
                    <span className="allies-count">
                        Alliés: {combatStats.aliveAllies}/{combatStats.totalAllies}
                    </span>
                    <span className="enemies-count">
                        Ennemis: {combatStats.aliveEnemies}/{combatStats.totalEnemies}
                    </span>
                </div>
            </div>

            {/* Action sélectionnée */}
            {selectedAction && (
                <div className="selected-action">
                    <div className="action-header">
                        <h4>Action sélectionnée: {selectedAction.type}</h4>
                        <button 
                            className="action-cancel-btn"
                            onClick={onActionCancel}
                        >
                            Annuler
                        </button>
                    </div>
                    <div className="action-instructions">
                        {selectedAction.targetRequired && "Cliquez sur une cible valide"}
                        {selectedAction.positionRequired && "Cliquez sur une position valide"}
                        {!selectedAction.targetRequired && !selectedAction.positionRequired && "Action prête à être exécutée"}
                    </div>
                </div>
            )}

            {/* Entités du joueur */}
            <div className="entities-section">
                <h4>Votre équipe</h4>
                <div className="entities-list">
                    {organizedEntities.players.map(entity => renderEntity(entity, 'player'))}
                </div>
            </div>

            {/* Compagnons */}
            {organizedEntities.companions.length > 0 && (
                <div className="entities-section">
                    <h4>Compagnons</h4>
                    <div className="entities-list">
                        {organizedEntities.companions.map(entity => renderEntity(entity, 'companion'))}
                    </div>
                </div>
            )}

            {/* Ennemis */}
            <div className="entities-section">
                <h4>Ennemis</h4>
                <div className="entities-list">
                    {organizedEntities.enemies.map(entity => renderEntity(entity, 'enemy'))}
                </div>
            </div>

            {/* Log de combat */}
            <div className="combat-log">
                <h4>Journal de combat</h4>
                <div className="log-content">
                    {combatLog.length === 0 ? (
                        <p className="log-empty">Aucun événement</p>
                    ) : (
                        combatLog.map((message, index) => (
                            <div key={index} className="log-message">
                                {message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Instructions générales */}
            <div className="combat-instructions">
                <h4>Instructions</h4>
                <ul>
                    <li>Cliquez sur vos entités pour sélectionner des actions</li>
                    <li>Les cases vertes indiquent les cibles/positions valides</li>
                    <li>Les cases rouges indiquent les cibles/positions invalides</li>
                    <li>L'étoile ⭐ indique l'entité dont c'est le tour</li>
                </ul>
            </div>
        </div>
    );
};

export default CombatUI;