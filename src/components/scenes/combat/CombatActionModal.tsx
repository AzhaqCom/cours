import React, { useMemo } from 'react';
import type { CombatEntityInstance } from '../../../types';
import type { ActionType } from '../../../systems/combat';
import type { SelectedAction } from '../CombatSceneRenderer';

export interface CombatActionModalProps {
    entity: CombatEntityInstance;
    availableActions: ActionType[];
    onActionSelect: (action: SelectedAction) => void;
    onClose: () => void;
}

export const CombatActionModal: React.FC<CombatActionModalProps> = ({
    entity,
    availableActions,
    onActionSelect,
    onClose
}) => {
    // Organiser les actions disponibles avec leurs métadonnées
    const actionData = useMemo(() => {
        const actions: Array<{
            type: ActionType;
            name: string;
            description: string;
            icon: string;
            targetRequired: boolean;
            positionRequired: boolean;
            disabled: boolean;
            disabledReason?: string;
        }> = [];

        availableActions.forEach(actionType => {
            switch (actionType) {
                case 'move':
                    actions.push({
                        type: 'move',
                        name: 'Déplacement',
                        description: `Se déplacer jusqu'à ${entity.entity.movement} cases`,
                        icon: '🚶',
                        targetRequired: false,
                        positionRequired: true,
                        disabled: entity.hasMoved,
                        disabledReason: entity.hasMoved ? 'Déjà déplacé ce tour' : undefined
                    });
                    break;

                case 'attack':
                    const hasWeapon = entity.entity.weaponIds && entity.entity.weaponIds.length > 0;
                    actions.push({
                        type: 'attack',
                        name: 'Attaquer',
                        description: hasWeapon 
                            ? `Attaquer avec ${entity.entity.weaponIds[0]}` 
                            : 'Attaque à mains nues',
                        icon: '⚔️',
                        targetRequired: true,
                        positionRequired: false,
                        disabled: entity.hasActed,
                        disabledReason: entity.hasActed ? 'Action déjà effectuée ce tour' : undefined
                    });
                    break;

                case 'cast':
                    const hasSpells = (entity.entity.spellIds?.length ?? 0) > 0;
                    actions.push({
                        type: 'cast',
                        name: 'Lancer un sort',
                        description: hasSpells 
                            ? `${entity.entity.spellIds?.length || 0} sort(s) disponible(s)`
                            : 'Aucun sort disponible',
                        icon: '🔮',
                        targetRequired: true,
                        positionRequired: false,
                        disabled: entity.hasActed || !hasSpells,
                        disabledReason: entity.hasActed 
                            ? 'Action déjà effectuée ce tour' 
                            : !hasSpells 
                            ? 'Aucun sort disponible'
                            : undefined
                    });
                    break;

                case 'defend':
                    actions.push({
                        type: 'defend',
                        name: 'Défendre',
                        description: 'Adopter une posture défensive (+2 CA jusqu\'au prochain tour)',
                        icon: '🛡️',
                        targetRequired: false,
                        positionRequired: false,
                        disabled: entity.hasActed,
                        disabledReason: entity.hasActed ? 'Action déjà effectuée ce tour' : undefined
                    });
                    break;

                case 'end_turn':
                    actions.push({
                        type: 'end_turn',
                        name: 'Passer le tour',
                        description: 'Terminer le tour de cette entité',
                        icon: '⏭️',
                        targetRequired: false,
                        positionRequired: false,
                        disabled: false
                    });
                    break;
            }
        });

        return actions;
    }, [availableActions, entity]);

    // Informations sur l'entité
    const entityInfo = useMemo(() => {
        const healthPercent = (entity.currentHp / entity.entity.maxHp) * 100;
        
        return {
            name: entity.entity.name,
            level: entity.entity.level || 1,
            hp: `${entity.currentHp}/${entity.entity.maxHp}`,
            healthPercent,
            ac: entity.entity.ac,
            movement: entity.entity.movement,
            hasActed: entity.hasActed,
            hasMoved: entity.hasMoved,
            weapons: entity.entity.weaponIds || [],
            spells: entity.entity.spellIds || []
        };
    }, [entity]);

    const handleActionClick = (actionInfo: {
        type: ActionType;
        name: string;
        description: string;
        icon: string;
        targetRequired: boolean;
        positionRequired: boolean;
        disabled: boolean;
        disabledReason?: string;
    }) => {
        if (actionInfo.disabled) return;

        const selectedAction: SelectedAction = {
            type: actionInfo.type as SelectedAction['type'],
            targetRequired: actionInfo.targetRequired,
            positionRequired: actionInfo.positionRequired
        };

        onActionSelect(selectedAction);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="combat-action-modal-backdrop" onClick={handleBackdropClick}>
            <div className="combat-action-modal">
                {/* En-tête */}
                <div className="modal-header">
                    <div className="entity-info">
                        <h3>{entityInfo.name}</h3>
                        <div className="entity-details">
                            <span>Niv. {entityInfo.level}</span>
                            <span>HP: {entityInfo.hp}</span>
                            <span>CA: {entityInfo.ac}</span>
                        </div>
                        
                        {/* Barre de vie */}
                        <div className="health-bar-container">
                            <div 
                                className="health-bar"
                                style={{ 
                                    width: `${entityInfo.healthPercent}%`,
                                    backgroundColor: entityInfo.healthPercent > 50 ? '#4CAF50' : entityInfo.healthPercent > 25 ? '#FF9800' : '#F44336'
                                }}
                            />
                        </div>
                        
                        {/* État du tour */}
                        <div className="turn-status">
                            {entityInfo.hasActed && (
                                <span className="status-badge status-acted">Action effectuée</span>
                            )}
                            {entityInfo.hasMoved && (
                                <span className="status-badge status-moved">A bougé</span>
                            )}
                            {!entityInfo.hasActed && !entityInfo.hasMoved && (
                                <span className="status-badge status-ready">Prêt</span>
                            )}
                        </div>
                    </div>

                    <button className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Actions disponibles */}
                <div className="actions-section">
                    <h4>Actions disponibles</h4>
                    <div className="actions-grid">
                        {actionData.map((action) => (
                            <button
                                key={action.type}
                                className={`action-btn ${action.disabled ? 'action-btn--disabled' : ''}`}
                                onClick={() => handleActionClick(action)}
                                disabled={action.disabled}
                                title={action.disabledReason || action.description}
                            >
                                <div className="action-icon">
                                    {action.icon}
                                </div>
                                <div className="action-content">
                                    <div className="action-name">
                                        {action.name}
                                    </div>
                                    <div className="action-description">
                                        {action.description}
                                    </div>
                                    {action.disabledReason && (
                                        <div className="action-disabled-reason">
                                            {action.disabledReason}
                                        </div>
                                    )}
                                </div>
                                <div className="action-requirements">
                                    {action.targetRequired && (
                                        <span className="requirement">🎯 Cible</span>
                                    )}
                                    {action.positionRequired && (
                                        <span className="requirement">📍 Position</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Équipement */}
                <div className="equipment-section">
                    {entityInfo.weapons.length > 0 && (
                        <div className="equipment-group">
                            <h5>Armes</h5>
                            <div className="equipment-list">
                                {entityInfo.weapons.map((weaponId, index) => (
                                    <span key={index} className="equipment-item">
                                        ⚔️ {weaponId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {entityInfo.spells.length > 0 && (
                        <div className="equipment-group">
                            <h5>Sorts</h5>
                            <div className="equipment-list">
                                {entityInfo.spells.map((spellId, index) => (
                                    <span key={index} className="equipment-item">
                                        🔮 {spellId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="instructions-section">
                    <h5>Instructions</h5>
                    <ul>
                        <li>Sélectionnez une action pour l'utiliser</li>
                        <li>Les actions marquées 🎯 nécessitent de sélectionner une cible</li>
                        <li>Les actions marquées 📍 nécessitent de sélectionner une position</li>
                        <li>Vous ne pouvez effectuer qu'une action principale par tour</li>
                        <li>Le déplacement peut être fait en plus d'une action</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CombatActionModal;