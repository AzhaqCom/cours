import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem, EquipmentSlots } from '../components/inventory/InventoryPanel';
import { EquipmentManager } from '../systems/EquipmentManager';
import type { Character } from '../types/Character';
// import { useGameStore } from './gameStore'; // Pour future synchronisation

// Statistiques d'inventaire
export interface InventoryStatistics {
    totalItems: number;
    totalValue: number;
    totalWeight: number;
    itemsByType: Record<string, number>;
    itemsByRarity: Record<string, number>;
    mostValuableItem: InventoryItem | null;
    oldestItem: InventoryItem | null;
    newestItem: InventoryItem | null;
}

// Historique des transactions
export interface Transaction {
    id: string;
    type: 'buy' | 'sell' | 'found' | 'quest' | 'crafted';
    item: InventoryItem;
    quantity: number;
    price?: number;
    merchant?: string;
    location?: string;
    timestamp: number;
}

interface InventoryState {
    // Inventaire du joueur
    playerItems: InventoryItem[];
    
    // Équipement actuel
    equippedItems: EquipmentSlots;
    equipmentManager?: EquipmentManager;
    
    // UI State
    isInventoryOpen: boolean;
    selectedTab: 'inventory' | 'equipment';
    
    // Filtres
    filters: {
        search: string;
        type: string;
        rarity: string;
        equipped: string;
    };

    // Historique et transactions
    transactionHistory: Transaction[];
    
    // Statistiques
    statistics: InventoryStatistics;
    
    // Paramètres
    settings: {
        autoSort: boolean;
        autoStack: boolean;
        showTooltips: boolean;
        compactView: boolean;
        highlightNew: boolean;
    };

    // Actions - Inventory Management
    addItem: (item: InventoryItem) => void;
    removeItem: (itemId: string) => void;
    updateItemQuantity: (itemId: string, quantity: number) => void;
    
    // Actions - Equipment Management
    initializeEquipmentManager: (character: Character) => void;
    equipItem: (item: InventoryItem, slot: keyof EquipmentSlots) => boolean;
    unequipItem: (slot: keyof EquipmentSlots) => boolean;
    swapEquipment: (fromSlot: keyof EquipmentSlots, toSlot: keyof EquipmentSlots) => boolean;
    autoEquipBest: () => void;
    
    // Actions - UI Management
    toggleInventory: () => void;
    setSelectedTab: (tab: 'inventory' | 'equipment') => void;
    setFilters: (filters: Partial<InventoryState['filters']>) => void;
    clearFilters: () => void;
    
    // Getters
    getEquippedStats: () => any;
    getEquippableItems: () => InventoryItem[];
    getFilteredItems: () => InventoryItem[];
    canEquipItem: (item: InventoryItem, slot: keyof EquipmentSlots) => boolean;
    
    // Utilities
    useItem: (itemId: string) => boolean;
    sellItem: (itemId: string) => number;
    getItemById: (itemId: string) => InventoryItem | undefined;
    
    // Nouvelles actions - Store Management
    syncWithGameStore: () => void;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
    updateStatistics: () => void;
    sortInventory: (sortBy: 'name' | 'type' | 'rarity' | 'value' | 'date') => void;
    stackSimilarItems: () => void;
    
    // Nouvelles actions - Settings
    updateSettings: (settings: Partial<InventoryState['settings']>) => void;
    
    // Nouveaux getters
    getTransactionHistory: () => Transaction[];
    getStatistics: () => InventoryStatistics;
    getItemsByCategory: (category: string) => InventoryItem[];
    getRecentItems: (hours?: number) => InventoryItem[];
    searchItems: (query: string) => InventoryItem[];
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            // État initial
            playerItems: [],
            equippedItems: {},
            isInventoryOpen: false,
            selectedTab: 'inventory',
            filters: {
                search: '',
                type: 'all',
                rarity: 'all',
                equipped: 'all'
            },
            
            // Nouvelles propriétés
            transactionHistory: [],
            statistics: {
                totalItems: 0,
                totalValue: 0,
                totalWeight: 0,
                itemsByType: {},
                itemsByRarity: {},
                mostValuableItem: null,
                oldestItem: null,
                newestItem: null
            },
            settings: {
                autoSort: false,
                autoStack: true,
                showTooltips: true,
                compactView: false,
                highlightNew: true
            },

    // Initialiser l'Equipment Manager avec un personnage
    initializeEquipmentManager: (character: Character) => {
        const manager = new EquipmentManager(character);
        set({ equipmentManager: manager });
        console.log('🔧 EquipmentManager initialisé pour', character.name);
    },

    // === GESTION INVENTAIRE ===
    
    addItem: (item: InventoryItem) => set((state) => {
        // Vérifier si l'item existe déjà (pour les stackables)
        const existingIndex = state.playerItems.findIndex(
            existing => existing.name === item.name && existing.type === item.type
        );

        if (existingIndex >= 0 && item.type === 'consumable') {
            // Empiler les consommables
            const newItems = [...state.playerItems];
            newItems[existingIndex] = {
                ...newItems[existingIndex],
                quantity: newItems[existingIndex].quantity + item.quantity
            };
            return { playerItems: newItems };
        } else {
            // Ajouter un nouvel item
            return {
                playerItems: [...state.playerItems, { ...item, id: `item-${Date.now()}-${Math.random()}` }]
            };
        }
    }),

    removeItem: (itemId: string) => set((state) => ({
        playerItems: state.playerItems.filter(item => item.id !== itemId)
    })),

    updateItemQuantity: (itemId: string, quantity: number) => set((state) => {
        if (quantity <= 0) {
            return { playerItems: state.playerItems.filter(item => item.id !== itemId) };
        }

        const newItems = state.playerItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
        );
        return { playerItems: newItems };
    }),

    // === GESTION ÉQUIPEMENT ===

    equipItem: (item: InventoryItem, slot: keyof EquipmentSlots) => {
        const { equipmentManager } = get();
        if (!equipmentManager) {
            console.error('❌ EquipmentManager non initialisé');
            return false;
        }

        const success = equipmentManager.equipItem(item, slot);
        if (success) {
            set({ equippedItems: equipmentManager.getEquippedItems() });
        }
        return success;
    },

    unequipItem: (slot: keyof EquipmentSlots) => {
        const { equipmentManager } = get();
        if (!equipmentManager) {
            console.error('❌ EquipmentManager non initialisé');
            return false;
        }

        const success = equipmentManager.unequipItem(slot);
        if (success) {
            set({ equippedItems: equipmentManager.getEquippedItems() });
        }
        return success;
    },

    swapEquipment: (fromSlot: keyof EquipmentSlots, toSlot: keyof EquipmentSlots) => {
        const { equipmentManager } = get();
        if (!equipmentManager) return false;

        const success = equipmentManager.swapItems(fromSlot, toSlot);
        if (success) {
            set({ equippedItems: equipmentManager.getEquippedItems() });
        }
        return success;
    },

    autoEquipBest: () => {
        const { equipmentManager, playerItems } = get();
        if (!equipmentManager) return;

        equipmentManager.autoEquipBest(playerItems);
        set({ equippedItems: equipmentManager.getEquippedItems() });
    },

    // === GESTION UI ===

    toggleInventory: () => set((state) => ({
        isInventoryOpen: !state.isInventoryOpen
    })),

    setSelectedTab: (tab) => set({ selectedTab: tab }),

    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    clearFilters: () => set({
        filters: {
            search: '',
            type: 'all',
            rarity: 'all',
            equipped: 'all'
        }
    }),

    // === GETTERS ===

    getEquippedStats: () => {
        const { equipmentManager } = get();
        return equipmentManager ? equipmentManager.getTotalStats() : {
            attack: 0,
            defense: 0,
            health: 0,
            mana: 0
        };
    },

    getEquippableItems: () => {
        const { playerItems } = get();
        return playerItems.filter(item => item.equipSlot);
    },

    getFilteredItems: () => {
        const { playerItems, filters, equippedItems } = get();
        
        return playerItems.filter(item => {
            // Filtre de recherche
            if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            
            // Filtre par type
            if (filters.type !== 'all' && item.type !== filters.type) {
                return false;
            }
            
            // Filtre par rareté
            if (filters.rarity !== 'all' && item.rarity !== filters.rarity) {
                return false;
            }
            
            // Filtre par statut d'équipement
            if (filters.equipped !== 'all') {
                const isEquipped = Object.values(equippedItems).some(equipped => equipped?.id === item.id);
                if (filters.equipped === 'equipped' && !isEquipped) return false;
                if (filters.equipped === 'unequipped' && isEquipped) return false;
            }
            
            return true;
        });
    },

    canEquipItem: (item: InventoryItem, slot: keyof EquipmentSlots) => {
        const { equipmentManager } = get();
        return equipmentManager ? equipmentManager.canEquipItem(item, slot) : false;
    },

    // === UTILITAIRES ===

    useItem: (itemId: string) => {
        const { playerItems } = get();
        const item = playerItems.find(i => i.id === itemId);
        
        if (!item || item.type !== 'consumable') {
            return false;
        }

        // Appliquer les effets de l'item (TODO: système d'effets)
        console.log(`🧪 Utilisation de ${item.name}`);
        
        // Réduire la quantité
        if (item.quantity > 1) {
            get().updateItemQuantity(itemId, item.quantity - 1);
        } else {
            get().removeItem(itemId);
        }
        
        return true;
    },

    sellItem: (itemId: string) => {
        const { playerItems } = get();
        const item = playerItems.find(i => i.id === itemId);
        
        if (!item) return 0;
        
        const sellPrice = Math.floor(item.value * 0.5); // 50% du prix d'achat
        
        // TODO: Intégrer avec le store d'or du jeu
        console.log(`💰 ${item.name} vendu pour ${sellPrice} or`);
        
        get().removeItem(itemId);
        return sellPrice;
    },

    getItemById: (itemId: string) => {
        const { playerItems } = get();
        return playerItems.find(item => item.id === itemId);
    },

    // === NOUVELLES FONCTIONNALITÉS ===

    // Synchronisation avec GameStore
    syncWithGameStore: () => {
        // Cette fonction peut être appelée pour synchroniser avec l'ancien gameStore
        // TODO: Intégrer quand nécessaire
        console.log('🔄 Synchronisation avec GameStore');
    },

    // Gestion des transactions
    addTransaction: (transactionData) => {
        const transaction: Transaction = {
            ...transactionData,
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        set((state) => ({
            transactionHistory: [...state.transactionHistory, transaction]
        }));

        // Mettre à jour les statistiques après transaction
        get().updateStatistics();
    },

    // Mise à jour des statistiques
    updateStatistics: () => {
        const { playerItems } = get();
        
        const statistics: InventoryStatistics = {
            totalItems: playerItems.length,
            totalValue: playerItems.reduce((sum, item) => sum + (item.value * item.quantity), 0),
            totalWeight: playerItems.reduce((sum, item) => sum + ((item.weight || 1) * item.quantity), 0),
            itemsByType: {},
            itemsByRarity: {},
            mostValuableItem: null,
            oldestItem: null,
            newestItem: null
        };

        // Compter par type et rareté
        playerItems.forEach(item => {
            statistics.itemsByType[item.type] = (statistics.itemsByType[item.type] || 0) + item.quantity;
            statistics.itemsByRarity[item.rarity] = (statistics.itemsByRarity[item.rarity] || 0) + item.quantity;
        });

        // Trouver l'item le plus cher
        statistics.mostValuableItem = playerItems.reduce((most, item) => {
            return (!most || item.value > most.value) ? item : most;
        }, null as InventoryItem | null);

        // Items par date (simulé avec ID qui contient timestamp)
        const sortedByTime = [...playerItems].sort((a, b) => {
            const timeA = parseInt(a.id.split('-')[1]) || 0;
            const timeB = parseInt(b.id.split('-')[1]) || 0;
            return timeA - timeB;
        });

        statistics.oldestItem = sortedByTime[0] || null;
        statistics.newestItem = sortedByTime[sortedByTime.length - 1] || null;

        set({ statistics });
    },

    // Tri de l'inventaire
    sortInventory: (sortBy) => {
        const { playerItems } = get();
        const sorted = [...playerItems];

        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'type':
                sorted.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
                break;
            case 'rarity':
                const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };
                sorted.sort((a, b) => (rarityOrder[b.rarity] - rarityOrder[a.rarity]) || a.name.localeCompare(b.name));
                break;
            case 'value':
                sorted.sort((a, b) => b.value - a.value);
                break;
            case 'date':
                sorted.sort((a, b) => {
                    const timeA = parseInt(a.id.split('-')[1]) || 0;
                    const timeB = parseInt(b.id.split('-')[1]) || 0;
                    return timeB - timeA; // Plus récent en premier
                });
                break;
        }

        set({ playerItems: sorted });
        console.log(`📊 Inventaire trié par ${sortBy}`);
    },

    // Stack des objets similaires
    stackSimilarItems: () => {
        const { playerItems } = get();
        const stackedItems: InventoryItem[] = [];
        const itemGroups = new Map<string, InventoryItem[]>();

        // Grouper les items similaires (même nom + type + stackable)
        playerItems.forEach(item => {
            if (item.type === 'consumable') { // Seulement les consommables stackables
                const key = `${item.name}-${item.type}-${item.rarity}`;
                if (!itemGroups.has(key)) {
                    itemGroups.set(key, []);
                }
                itemGroups.get(key)!.push(item);
            } else {
                stackedItems.push(item); // Items non-stackables ajoutés tels quels
            }
        });

        // Merger les groupes
        itemGroups.forEach(items => {
            if (items.length > 1) {
                const mergedItem = {
                    ...items[0],
                    quantity: items.reduce((sum, item) => sum + item.quantity, 0)
                };
                stackedItems.push(mergedItem);
            } else {
                stackedItems.push(items[0]);
            }
        });

        set({ playerItems: stackedItems });
        console.log('📦 Objects similaires empilés');
        get().updateStatistics();
    },

    // Paramètres
    updateSettings: (newSettings) => {
        set((state) => ({
            settings: { ...state.settings, ...newSettings }
        }));
    },

    // === NOUVEAUX GETTERS ===

    getTransactionHistory: () => {
        const { transactionHistory } = get();
        return [...transactionHistory].reverse(); // Plus récent en premier
    },

    getStatistics: () => {
        const { statistics } = get();
        return statistics;
    },

    getItemsByCategory: (category) => {
        const { playerItems } = get();
        return playerItems.filter(item => item.type === category);
    },

    getRecentItems: (hours = 24) => {
        const { playerItems } = get();
        const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
        
        return playerItems.filter(item => {
            const itemTime = parseInt(item.id.split('-')[1]) || 0;
            return itemTime > cutoffTime;
        });
    },

    searchItems: (query) => {
        const { playerItems } = get();
        const lowercaseQuery = query.toLowerCase();
        
        return playerItems.filter(item => 
            item.name.toLowerCase().includes(lowercaseQuery) ||
            item.description.toLowerCase().includes(lowercaseQuery) ||
            item.type.toLowerCase().includes(lowercaseQuery)
        );
    }
}),
        {
            name: 'inventory-store', // Nom pour localStorage
            partialize: (state) => ({
                // Sauvegarder seulement certaines propriétés
                playerItems: state.playerItems,
                equippedItems: state.equippedItems,
                transactionHistory: state.transactionHistory,
                settings: state.settings,
                statistics: state.statistics
                // Ne pas sauvegarder: equipmentManager (sera recréé), UI state, filtres
            }),
        }
    )
);

// === HOOKS UTILITAIRES ===

// Hook pour les stats d'équipement
export const useEquipmentStats = () => {
    const getEquippedStats = useInventoryStore(state => state.getEquippedStats);
    return getEquippedStats();
};

// Hook pour vérifier si on peut équiper un item
export const useCanEquip = (item: InventoryItem, slot: keyof EquipmentSlots) => {
    const canEquipItem = useInventoryStore(state => state.canEquipItem);
    return canEquipItem(item, slot);
};

// Hook pour obtenir les items filtrés
export const useFilteredItems = () => {
    const getFilteredItems = useInventoryStore(state => state.getFilteredItems);
    return getFilteredItems();
};

export default useInventoryStore;