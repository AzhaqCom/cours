import React from 'react';
import type { CombatState } from '../../../systems/combat';
import type { CombatEntityInstance } from '../../../types';
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
    currentEntity,
    isPlayerTurn,
    selectedAction,
    onActionCancel,
    combatLog
}) => {

    return (
        <div className="combat-ui">
            {/* Header avec nom du joueur et tour */}
            <div className="player-header">
                <h2>🛡️ Actions de {currentEntity?.entity.name || 'Joueur'}</h2>
                {isPlayerTurn ? (
                    <span className="turn-indicator active">⚡ Votre tour</span>
                ) : (
                    <span className="turn-indicator waiting">⏳ En attente</span>
                )}
            </div>

            {/* Actions du joueur uniquement */}
            {isPlayerTurn && currentEntity && (
                <div className="player-actions">
                    <div className="action-categories">
                        {/* Actions de mouvement */}
                        <div className="action-group">
                            <h4>Mouvement</h4>
                            <button className="action-btn movement">
                                ⭐ Se déplacer
                                <span className="movement-info">({currentEntity.entity.movement} cases)</span>
                            </button>
                        </div>

                        {/* Actions d'attaque */}
                        <div className="action-group">
                            <h4>Attaques</h4>
                            <button className="action-btn attack">
                                ⚔️ Dague
                                <span className="damage-info">Dégâts: 1d4</span>
                            </button>
                        </div>

                        {/* Sorts si disponibles */}
                        {currentEntity.entity.spellIds && currentEntity.entity.spellIds.length > 0 && (
                            <div className="action-group">
                                <h4>Sorts</h4>
                                {currentEntity.entity.spellIds.map(spellId => (
                                    <button key={spellId} className="action-btn spell">
                                        ✨ {spellId}
                                        <span className="spell-info">Niveau 1</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action de fin de tour */}
                        <div className="action-group">
                            <button className="action-btn end-turn">
                                Passer le tour
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action sélectionnée */}
            {selectedAction && (
                <div className="selected-action">
                    <div className="action-header">
                        <h4>🎯 {selectedAction.type}</h4>
                        <button className="cancel-btn" onClick={onActionCancel}>✕</button>
                    </div>
                    <div className="action-instructions">
                        {selectedAction.targetRequired && "Cliquez sur une cible"}
                        {selectedAction.positionRequired && "Cliquez sur une position"}
                    </div>
                </div>
            )}

            {/* Log de combat - Simplifié */}
            <div className="combat-log">
                <div className="log-header">
                    <h4>Combat ({combatLog.length})</h4>
                    <button className="clear-log">🗑 Vider</button>
                </div>
                <div className="log-content">
                    {combatLog.length === 0 ? (
                        <div className="log-empty">
                            🏹 Objet obtenu : Arc Du MJ<br/>
                            🎭 Rhingann te rejoint dans ton aventure !<br/>
                            ⚔️ Un combat commence !<br/>
                            🎲 Lyra a obtenu 22 en initiative !
                        </div>
                    ) : (
                        combatLog.slice(-8).map((message, index) => (
                            <div key={index} className="log-entry">
                                {message}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CombatUI;