import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import type { InventoryItem, EquipmentSlots as EquipmentSlotsType } from './InventoryPanel';

interface EquipmentSlotsProps {
    equippedItems: EquipmentSlotsType;
    onItemClick: (item: InventoryItem, event: React.MouseEvent) => void;
}

export function EquipmentSlots({ equippedItems, onItemClick }: EquipmentSlotsProps) {
    const renderSlot = (
        slotKey: keyof EquipmentSlotsType,
        label: string,
        icon: string
    ) => (
        <Droppable droppableId={`equipment-${slotKey}`} key={slotKey}>
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div 
                    className={`equipment-slot ${snapshot.isDraggingOver ? 'equipment-slot--drag-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    <div className="slot-header">
                        <span className="slot-icon">{icon}</span>
                        <span className="slot-label">{label}</span>
                    </div>
                    
                    <div className="slot-content">
                        {equippedItems[slotKey] ? (
                            <div
                                className={`equipped-item item-rarity--${equippedItems[slotKey]!.rarity}`}
                                onClick={(e) => onItemClick(equippedItems[slotKey]!, e)}
                            >
                                <div className="item-icon">
                                    {getSlotIcon(equippedItems[slotKey]!.type)}
                                </div>
                                <div className="item-name">{equippedItems[slotKey]!.name}</div>
                                {equippedItems[slotKey]!.stats && (
                                    <div className="item-stats">
                                        {Object.entries(equippedItems[slotKey]!.stats!).map(([stat, value]) => (
                                            <span key={stat} className="stat-bonus">
                                                +{value} {getStatIcon(stat)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-slot">
                                <span className="empty-slot-icon">{icon}</span>
                                <span className="empty-slot-text">Vide</span>
                            </div>
                        )}
                    </div>
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );

    return (
        <div className="equipment-slots">
            <div className="equipment-grid">
                {/* Main Hand */}
                <div className="slot-row">
                    {renderSlot('mainHand', 'Main Principale', '⚔️')}
                </div>
                
                {/* Off Hand & Armor */}
                <div className="slot-row">
                    {renderSlot('offHand', 'Main Secondaire', '🛡️')}
                    {renderSlot('armor', 'Armure', '🥼')}
                </div>
                
                {/* Accessory */}
                <div className="slot-row">
                    {renderSlot('accessory', 'Accessoire', '💎')}
                </div>
            </div>
            
            <div className="equipment-info">
                <div className="equipped-count">
                    <span className="info-icon">📊</span>
                    <span className="info-text">
                        {Object.values(equippedItems).filter(Boolean).length}/4 équipé
                    </span>
                </div>
            </div>
        </div>
    );
}

function getSlotIcon(type: InventoryItem['type']): string {
    switch (type) {
        case 'weapon': return '⚔️';
        case 'armor': return '🛡️';
        case 'accessory': return '💎';
        case 'consumable': return '🧪';
        case 'misc': default: return '📦';
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

export default EquipmentSlots;