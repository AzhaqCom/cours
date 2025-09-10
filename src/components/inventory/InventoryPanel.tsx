import React, { useState, useCallback, useMemo } from 'react';
import type { Character } from '../../types/Character';
import { useGameStore } from '../../store/gameStore';
import { EquipmentSlots } from './EquipmentSlots';
import { ItemTooltip } from './ItemTooltip';
import { ItemFilters } from './ItemFilters';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import './InventoryPanel.css';

// Types pour l'inventaire amélioré
export interface InventoryItem {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'consumable' | 'accessory' | 'misc';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    quantity: number;
    equipped: boolean;
    equipSlot?: 'mainHand' | 'offHand' | 'armor' | 'accessory';
    stats?: Record<string, number>;
    description: string;
    value: number;
    weight?: number;
    requirements?: {
        level?: number;
        class?: string[];
        stats?: Record<string, number>;
    };
    image?: string;
}

export interface EquipmentSlots {
    mainHand?: InventoryItem;
    offHand?: InventoryItem;
    armor?: InventoryItem;
    accessory?: InventoryItem;
}

interface InventoryPanelProps {
    character: Character;
    onClose?: () => void;
}

export function InventoryPanel({ character, onClose }: InventoryPanelProps) {
    const [selectedTab, setSelectedTab] = useState<'inventory' | 'equipment'>('inventory');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        rarity: 'all',
        equipped: 'all'
    });

    const playerInventory = useGameStore(state => state.playerInventory);
    const playerGold = useGameStore(state => state.playerGold);

    // Convertir l'inventaire basique en items détaillés
    const inventoryItems = useMemo((): InventoryItem[] => {
        const baseItems: InventoryItem[] = character.inventory.map((item, index) => ({
            id: `base-${index}`,
            name: item,
            type: getItemType(item),
            rarity: 'common',
            quantity: 1,
            equipped: false,
            description: `${item} - Équipement de base`,
            value: getItemValue(item),
            weight: 1
        }));

        const storeItems: InventoryItem[] = playerInventory.map((item, index) => ({
            id: `store-${index}`,
            name: item,
            type: getItemType(item),
            rarity: getItemRarity(item),
            quantity: 1,
            equipped: false,
            equipSlot: getEquipSlot(item),
            stats: getItemStats(item),
            description: `${item} - Objet acquis`,
            value: getItemValue(item),
            weight: getItemWeight(item)
        }));

        return [...baseItems, ...storeItems];
    }, [character.inventory, playerInventory]);

    // Simuler équipement actuel (TODO: intégrer avec vrai système)
    const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({});

    // Filtrer les items
    const filteredItems = useMemo(() => {
        return inventoryItems.filter(item => {
            if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            if (filters.type !== 'all' && item.type !== filters.type) {
                return false;
            }
            if (filters.rarity !== 'all' && item.rarity !== filters.rarity) {
                return false;
            }
            if (filters.equipped !== 'all') {
                const isEquipped = Object.values(equippedItems).some(equipped => equipped?.id === item.id);
                if (filters.equipped === 'equipped' && !isEquipped) return false;
                if (filters.equipped === 'unequipped' && isEquipped) return false;
            }
            return true;
        });
    }, [inventoryItems, filters, equippedItems]);

    // Calculer les stats totales
    const totalStats = useMemo(() => {
        const stats = { attack: 0, defense: 0, health: 0, mana: 0 };
        Object.values(equippedItems).forEach(item => {
            if (item?.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    if (stats.hasOwnProperty(stat)) {
                        (stats as any)[stat] += value;
                    }
                });
            }
        });
        return stats;
    }, [equippedItems]);

    // Drag & Drop handlers
    const handleOnDragEnd = useCallback((result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        // Drag vers un slot d'équipement
        if (destination.droppableId.startsWith('equipment-')) {
            const slotName = destination.droppableId.replace('equipment-', '') as keyof EquipmentSlots;
            const item = inventoryItems.find(i => i.id === draggableId);
            
            if (item && canEquip(item, slotName)) {
                setEquippedItems(prev => {
                    // Déséquiper l'ancien item si présent
                    const newEquipped = { ...prev };
                    if (newEquipped[slotName]) {
                        // L'ancien item retourne dans l'inventaire (déjà présent)
                    }
                    newEquipped[slotName] = item;
                    return newEquipped;
                });
            }
        }

        // Drag depuis un slot d'équipement vers l'inventaire
        if (source.droppableId.startsWith('equipment-') && destination.droppableId === 'inventory') {
            const slotName = source.droppableId.replace('equipment-', '') as keyof EquipmentSlots;
            setEquippedItems(prev => ({
                ...prev,
                [slotName]: undefined
            }));
        }
    }, [inventoryItems]);

    // Vérifier si un item peut être équipé dans un slot
    const canEquip = useCallback((item: InventoryItem, slot: keyof EquipmentSlots): boolean => {
        if (!item.equipSlot) return false;
        if (item.equipSlot !== slot) return false;
        
        // Vérifier les requirements
        if (item.requirements) {
            if (item.requirements.level && character.level < item.requirements.level) {
                return false;
            }
            if (item.requirements.class && !item.requirements.class.includes(character.class)) {
                return false;
            }
        }
        
        return true;
    }, [character]);

    // Gestionnaires d'événements
    const handleItemClick = useCallback((item: InventoryItem, event: React.MouseEvent) => {
        setSelectedItem(item);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    }, []);

    const handleItemDoubleClick = useCallback((item: InventoryItem) => {
        if (item.equipSlot) {
            // Auto-équiper
            if (canEquip(item, item.equipSlot)) {
                setEquippedItems(prev => ({
                    ...prev,
                    [item.equipSlot!]: item
                }));
            }
        } else if (item.type === 'consumable') {
            // Utiliser consommable
            console.log('Utiliser:', item.name);
            // TODO: Intégrer avec système de consommables
        }
    }, [canEquip]);

    const handleUseItem = useCallback((item: InventoryItem) => {
        if (item.type === 'consumable') {
            console.log('Utilisation de:', item.name);
            // TODO: Appliquer les effets du consommable
        }
    }, []);

    const handleSellItem = useCallback((item: InventoryItem) => {
        const sellPrice = Math.floor(item.value * 0.5);
        console.log(`Vendre ${item.name} pour ${sellPrice} or`);
        // TODO: Intégrer avec système d'or
    }, []);

    const closeTooltip = useCallback(() => {
        setSelectedItem(null);
        setTooltipPosition(null);
    }, []);

    return (
        <div className="inventory-panel">
            {/* En-tête */}
            <div className="inventory-header">
                <div className="inventory-title">
                    <h3>🎒 Inventaire & Équipement</h3>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>✕</button>
                    )}
                </div>
                
                <div className="inventory-tabs">
                    <button
                        className={`tab ${selectedTab === 'inventory' ? 'tab--active' : ''}`}
                        onClick={() => setSelectedTab('inventory')}
                    >
                        📦 Inventaire
                    </button>
                    <button
                        className={`tab ${selectedTab === 'equipment' ? 'tab--active' : ''}`}
                        onClick={() => setSelectedTab('equipment')}
                    >
                        ⚔️ Équipement
                    </button>
                </div>

                <div className="inventory-stats">
                    <div className="stat-item">
                        <span className="stat-icon">💰</span>
                        <span className="stat-value">{playerGold}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">📦</span>
                        <span className="stat-value">{inventoryItems.length}/50</span>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <div className="inventory-content">
                    {selectedTab === 'inventory' ? (
                        <>
                            {/* Filtres */}
                            <ItemFilters 
                                filters={filters} 
                                onFiltersChange={setFilters} 
                            />

                            {/* Grille d'inventaire */}
                            <Droppable droppableId="inventory" direction="horizontal">
                                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                    <div
                                        className={`inventory-grid ${snapshot.isDraggingOver ? 'inventory-grid--drag-over' : ''}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {filteredItems.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                    <div
                                                        className={`inventory-item ${snapshot.isDragging ? 'inventory-item--dragging' : ''}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={(e) => handleItemClick(item, e)}
                                                        onDoubleClick={() => handleItemDoubleClick(item)}
                                                    >
                                                        <div className={`item-icon item-rarity--${item.rarity}`}>
                                                            {getItemIcon(item.type)}
                                                        </div>
                                                        <div className="item-name">{item.name}</div>
                                                        {item.quantity > 1 && (
                                                            <div className="item-quantity">{item.quantity}</div>
                                                        )}
                                                        <div className="item-actions">
                                                            {item.type === 'consumable' && (
                                                                <button 
                                                                    className="action-btn action-btn--use"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUseItem(item);
                                                                    }}
                                                                >
                                                                    Use
                                                                </button>
                                                            )}
                                                            <button 
                                                                className="action-btn action-btn--sell"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSellItem(item);
                                                                }}
                                                            >
                                                                Sell
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </>
                    ) : (
                        <>
                            {/* Vue équipement */}
                            <div className="equipment-view">
                                <EquipmentSlots 
                                    equippedItems={equippedItems}
                                    onItemClick={handleItemClick}
                                />
                                
                                <div className="equipment-stats">
                                    <h4>📊 Statistiques</h4>
                                    <div className="stats-grid">
                                        <div className="stat-row">
                                            <span>⚔️ Attaque:</span>
                                            <span className="stat-value">+{totalStats.attack}</span>
                                        </div>
                                        <div className="stat-row">
                                            <span>🛡️ Défense:</span>
                                            <span className="stat-value">+{totalStats.defense}</span>
                                        </div>
                                        <div className="stat-row">
                                            <span>❤️ Santé:</span>
                                            <span className="stat-value">+{totalStats.health}</span>
                                        </div>
                                        <div className="stat-row">
                                            <span>🔮 Mana:</span>
                                            <span className="stat-value">+{totalStats.mana}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DragDropContext>

            {/* Tooltip */}
            {selectedItem && tooltipPosition && (
                <ItemTooltip
                    item={selectedItem}
                    position={tooltipPosition}
                    onClose={closeTooltip}
                />
            )}
        </div>
    );
}

// Fonctions utilitaires (TODO: déplacer vers une vraie base de données)
function getItemType(itemName: string): InventoryItem['type'] {
    if (itemName.includes('sword') || itemName.includes('bow') || itemName.includes('staff')) return 'weapon';
    if (itemName.includes('armor') || itemName.includes('shield') || itemName.includes('helm')) return 'armor';
    if (itemName.includes('potion') || itemName.includes('scroll')) return 'consumable';
    if (itemName.includes('ring') || itemName.includes('amulet')) return 'accessory';
    return 'misc';
}

function getItemRarity(itemName: string): InventoryItem['rarity'] {
    if (itemName.includes('legendary') || itemName.includes('dragon')) return 'legendary';
    if (itemName.includes('epic') || itemName.includes('enchanted')) return 'epic';
    if (itemName.includes('rare') || itemName.includes('magic')) return 'rare';
    if (itemName.includes('uncommon') || itemName.includes('fine')) return 'uncommon';
    return 'common';
}

function getEquipSlot(itemName: string): InventoryItem['equipSlot'] {
    if (itemName.includes('sword') || itemName.includes('bow') || itemName.includes('staff')) return 'mainHand';
    if (itemName.includes('shield')) return 'offHand';
    if (itemName.includes('armor') || itemName.includes('robe')) return 'armor';
    if (itemName.includes('ring') || itemName.includes('amulet')) return 'accessory';
    return undefined;
}

function getItemStats(itemName: string): Record<string, number> | undefined {
    // Simuler des stats basiques
    const stats: Record<string, number> = {};
    
    if (itemName.includes('sword')) stats.attack = 5;
    if (itemName.includes('bow')) stats.attack = 4;
    if (itemName.includes('staff')) stats.mana = 10;
    if (itemName.includes('shield')) stats.defense = 3;
    if (itemName.includes('armor')) stats.defense = 5;
    if (itemName.includes('ring')) stats.health = 10;
    
    return Object.keys(stats).length > 0 ? stats : undefined;
}

function getItemValue(itemName: string): number {
    if (itemName.includes('legendary')) return 1000;
    if (itemName.includes('epic')) return 500;
    if (itemName.includes('rare')) return 100;
    if (itemName.includes('uncommon')) return 50;
    return 10;
}

function getItemWeight(itemName: string): number {
    if (itemName.includes('armor')) return 10;
    if (itemName.includes('sword')) return 5;
    if (itemName.includes('potion')) return 1;
    return 2;
}

function getItemIcon(type: InventoryItem['type']): string {
    switch (type) {
        case 'weapon': return '⚔️';
        case 'armor': return '🛡️';
        case 'consumable': return '🧪';
        case 'accessory': return '💎';
        case 'misc': default: return '📦';
    }
}

export default InventoryPanel;