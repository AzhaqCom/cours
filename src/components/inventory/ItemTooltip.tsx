import { useEffect, useRef } from 'react';
import type { InventoryItem } from './InventoryPanel';

interface ItemTooltipProps {
    item: InventoryItem;
    position: { x: number; y: number };
    onClose: () => void;
}

export function ItemTooltip({ item, position, onClose }: ItemTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Fermer au clic extérieur ou Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Calculer la position optimale pour éviter le débordement
    const getOptimalPosition = () => {
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const padding = 10;
        
        let x = position.x + 10;
        let y = position.y - 10;

        // Ajuster X si débordement à droite
        if (x + tooltipWidth > window.innerWidth - padding) {
            x = position.x - tooltipWidth - 10;
        }

        // Ajuster Y si débordement en bas
        if (y + tooltipHeight > window.innerHeight - padding) {
            y = position.y - tooltipHeight - 10;
        }

        // S'assurer que les coordonnées restent positives
        x = Math.max(padding, x);
        y = Math.max(padding, y);

        return { x, y };
    };

    const optimalPosition = getOptimalPosition();

    return (
        <div
            ref={tooltipRef}
            className="item-tooltip"
            style={{
                position: 'fixed',
                left: `${optimalPosition.x}px`,
                top: `${optimalPosition.y}px`,
                zIndex: 1000
            }}
        >
            {/* En-tête */}
            <div className={`tooltip-header tooltip-header--${item.rarity}`}>
                <div className="header-main">
                    <span className="item-icon">{getItemIcon(item.type)}</span>
                    <div className="item-title">
                        <h4 className="item-name">{item.name}</h4>
                        <span className="item-type">{getTypeLabel(item.type)}</span>
                    </div>
                </div>
                <button className="close-tooltip" onClick={onClose}>✕</button>
            </div>

            {/* Corps */}
            <div className="tooltip-body">
                {/* Description */}
                <div className="item-description">
                    <p>{item.description}</p>
                </div>

                {/* Statistiques */}
                {item.stats && Object.keys(item.stats).length > 0 && (
                    <div className="item-stats-section">
                        <h5>📊 Statistiques</h5>
                        <div className="stats-list">
                            {Object.entries(item.stats).map(([stat, value]) => (
                                <div key={stat} className="stat-row">
                                    <span className="stat-name">
                                        {getStatIcon(stat)} {getStatLabel(stat)}
                                    </span>
                                    <span className={`stat-value ${value > 0 ? 'stat-positive' : 'stat-negative'}`}>
                                        {value > 0 ? '+' : ''}{value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Requirements */}
                {item.requirements && (
                    <div className="item-requirements">
                        <h5>⚠️ Prérequis</h5>
                        <div className="requirements-list">
                            {item.requirements.level && (
                                <div className="requirement">
                                    <span>📊 Niveau: {item.requirements.level}</span>
                                </div>
                            )}
                            {item.requirements.class && (
                                <div className="requirement">
                                    <span>🎭 Classe: {item.requirements.class.join(', ')}</span>
                                </div>
                            )}
                            {item.requirements.stats && (
                                Object.entries(item.requirements.stats).map(([stat, value]) => (
                                    <div key={stat} className="requirement">
                                        <span>{getStatIcon(stat)} {getStatLabel(stat)}: {value}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Informations générales */}
                <div className="item-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">💰 Valeur:</span>
                            <span className="info-value">{item.value} or</span>
                        </div>
                        {item.weight && (
                            <div className="info-item">
                                <span className="info-label">⚖️ Poids:</span>
                                <span className="info-value">{item.weight} kg</span>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="info-label">⭐ Rareté:</span>
                            <span className={`info-value rarity-${item.rarity}`}>
                                {getRarityLabel(item.rarity)}
                            </span>
                        </div>
                        {item.quantity > 1 && (
                            <div className="info-item">
                                <span className="info-label">📦 Quantité:</span>
                                <span className="info-value">{item.quantity}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Slot d'équipement */}
                {item.equipSlot && (
                    <div className="equip-info">
                        <span className="equip-slot">
                            🔧 Se place dans: {getSlotLabel(item.equipSlot)}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="tooltip-actions">
                {item.type === 'consumable' && (
                    <button className="action-btn action-btn--use">
                        🧪 Utiliser
                    </button>
                )}
                {item.equipSlot && !item.equipped && (
                    <button className="action-btn action-btn--equip">
                        ⚔️ Équiper
                    </button>
                )}
                {item.equipped && (
                    <button className="action-btn action-btn--unequip">
                        📦 Déséquiper
                    </button>
                )}
                <button className="action-btn action-btn--sell">
                    💰 Vendre ({Math.floor(item.value * 0.5)} or)
                </button>
            </div>
        </div>
    );
}

// Fonctions utilitaires
function getItemIcon(type: InventoryItem['type']): string {
    switch (type) {
        case 'weapon': return '⚔️';
        case 'armor': return '🛡️';
        case 'consumable': return '🧪';
        case 'accessory': return '💎';
        case 'misc': default: return '📦';
    }
}

function getTypeLabel(type: InventoryItem['type']): string {
    switch (type) {
        case 'weapon': return 'Arme';
        case 'armor': return 'Armure';
        case 'consumable': return 'Consommable';
        case 'accessory': return 'Accessoire';
        case 'misc': default: return 'Divers';
    }
}

function getStatIcon(stat: string): string {
    switch (stat) {
        case 'attack': return '⚔️';
        case 'defense': return '🛡️';
        case 'health': return '❤️';
        case 'mana': return '🔮';
        default: return '📊';
    }
}

function getStatLabel(stat: string): string {
    switch (stat) {
        case 'attack': return 'Attaque';
        case 'defense': return 'Défense';
        case 'health': return 'Santé';
        case 'mana': return 'Mana';
        default: return stat;
    }
}

function getRarityLabel(rarity: InventoryItem['rarity']): string {
    switch (rarity) {
        case 'common': return 'Commun';
        case 'uncommon': return 'Peu commun';
        case 'rare': return 'Rare';
        case 'epic': return 'Épique';
        case 'legendary': return 'Légendaire';
        default: return rarity;
    }
}

function getSlotLabel(slot: string): string {
    switch (slot) {
        case 'mainHand': return 'Main principale';
        case 'offHand': return 'Main secondaire';
        case 'armor': return 'Armure';
        case 'accessory': return 'Accessoire';
        default: return slot;
    }
}

export default ItemTooltip;