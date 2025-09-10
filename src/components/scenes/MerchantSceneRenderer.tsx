import React, { useState, useMemo, useCallback } from 'react';
import type { MerchantScene } from '../../types/Scene';
import './merchant/MerchantScene.css';

// Types pour l'interface marchand
export type MerchantView = 'shop' | 'inventory' | 'compare';
export type TransactionType = 'buy' | 'sell';

export interface ShopItem {
    itemId: string;
    quantity: number;
    basePrice: number;
    finalPrice: number;
    priceMultiplier: number;
    available: boolean;
    // TODO: Récupérer depuis la base de données des items
    name: string;
    description: string;
    type: 'weapon' | 'armor' | 'consumable' | 'misc';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    stats?: Record<string, number>;
}

export interface PlayerItem {
    itemId: string;
    quantity: number;
    equipped: boolean;
    sellPrice: number;
    // TODO: Récupérer depuis l'inventaire du joueur
    name: string;
    description: string;
    type: 'weapon' | 'armor' | 'consumable' | 'misc';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    stats?: Record<string, number>;
}

export interface MerchantSceneRendererProps {
    scene: MerchantScene;
    onSceneComplete: (choiceId?: string) => void;
}

export const MerchantSceneRenderer: React.FC<MerchantSceneRendererProps> = ({
    scene,
    onSceneComplete
}) => {
    const [currentView, setCurrentView] = useState<MerchantView>('shop');
    // const [selectedItem] = useState<ShopItem | PlayerItem | null>(null); // TODO: Utiliser pour modal détails
    const [playerGold, setPlayerGold] = useState(1000); // TODO: Récupérer depuis le store du joueur
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'type' | 'rarity'>('name');
    const [searchQuery, setSearchQuery] = useState('');

    // Simuler les items du marchand (TODO: récupérer depuis la vraie base de données)
    const shopItems = useMemo((): ShopItem[] => {
        return scene.inventory.map(invItem => ({
            itemId: invItem.itemId,
            quantity: invItem.quantity,
            basePrice: getItemBasePrice(invItem.itemId),
            finalPrice: getItemBasePrice(invItem.itemId) * (invItem.priceMultiplier || 1),
            priceMultiplier: invItem.priceMultiplier || 1,
            available: invItem.quantity !== 0,
            // Données simulées - TODO: remplacer par vraie DB
            name: getItemName(invItem.itemId),
            description: getItemDescription(invItem.itemId),
            type: getItemType(invItem.itemId),
            rarity: getItemRarity(invItem.itemId),
            stats: getItemStats(invItem.itemId)
        }));
    }, [scene.inventory]);

    // Simuler l'inventaire du joueur (TODO: récupérer depuis le store)
    const playerItems = useMemo((): PlayerItem[] => {
        // Inventaire simulé
        return [
            {
                itemId: 'sword_rusty',
                quantity: 1,
                equipped: true,
                sellPrice: 15,
                name: 'Épée Rouillée',
                description: 'Une vieille épée qui a connu des jours meilleurs.',
                type: 'weapon',
                rarity: 'common',
                stats: { attack: 3 }
            },
            {
                itemId: 'potion_health',
                quantity: 5,
                equipped: false,
                sellPrice: 8,
                name: 'Potion de Soins',
                description: 'Restaure 50 HP.',
                type: 'consumable',
                rarity: 'common'
            }
        ];
    }, []);

    // Filtrer et trier les items
    const filteredShopItems = useMemo(() => {
        let items = shopItems;

        // Filtre par type
        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }

        // Filtre par recherche
        if (searchQuery) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Tri
        items.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.finalPrice - b.finalPrice;
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'rarity':
                    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
                    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                default:
                    return 0;
            }
        });

        return items;
    }, [shopItems, filterType, searchQuery, sortBy]);

    const filteredPlayerItems = useMemo(() => {
        let items = playerItems;

        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }

        if (searchQuery) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return items;
    }, [playerItems, filterType, searchQuery]);

    // Calculer le total du panier
    const cartTotal = useMemo(() => {
        let total = 0;
        cart.forEach((quantity, itemId) => {
            const item = shopItems.find(i => i.itemId === itemId);
            if (item) {
                total += item.finalPrice * quantity;
            }
        });
        return total;
    }, [cart, shopItems]);

    // Gestionnaires d'événements
    const handleAddToCart = useCallback((item: ShopItem, quantity: number = 1) => {
        setCart(prev => {
            const newCart = new Map(prev);
            const currentQuantity = newCart.get(item.itemId) || 0;
            const maxQuantity = item.quantity === -1 ? 999 : item.quantity;
            const newQuantity = Math.min(currentQuantity + quantity, maxQuantity);
            
            if (newQuantity <= 0) {
                newCart.delete(item.itemId);
            } else {
                newCart.set(item.itemId, newQuantity);
            }
            return newCart;
        });
    }, []);

    const handleRemoveFromCart = useCallback((itemId: string) => {
        setCart(prev => {
            const newCart = new Map(prev);
            newCart.delete(itemId);
            return newCart;
        });
    }, []);

    const handlePurchase = useCallback(() => {
        if (cartTotal > playerGold) return;

        // TODO: Intégrer avec le système d'inventaire réel
        console.log('Achat effectué:', Object.fromEntries(cart));
        setPlayerGold(prev => prev - cartTotal);
        setCart(new Map());
        
        // Afficher confirmation
        alert(`Achat effectué pour ${cartTotal} pièces d'or !`);
    }, [cartTotal, playerGold, cart]);

    const handleSellItem = useCallback((item: PlayerItem, quantity: number = 1) => {
        // TODO: Intégrer avec le système d'inventaire réel
        const earnings = item.sellPrice * quantity;
        setPlayerGold(prev => prev + earnings);
        console.log('Vente effectuée:', item.name, 'x', quantity, 'pour', earnings, 'or');
        
        // Afficher confirmation
        alert(`Vendu ${item.name} x${quantity} pour ${earnings} pièces d'or !`);
    }, []);

    const handleExit = useCallback((choiceId?: string) => {
        onSceneComplete(choiceId);
    }, [onSceneComplete]);

    // Rendu d'un item de boutique
    const renderShopItem = useCallback((item: ShopItem) => {
        const cartQuantity = cart.get(item.itemId) || 0;
        const canAfford = item.finalPrice <= playerGold;
        const inStock = item.available && (item.quantity === -1 || item.quantity > 0);

        return (
            <div 
                key={item.itemId}
                className={`shop-item ${!canAfford ? 'shop-item--unaffordable' : ''} ${!inStock ? 'shop-item--out-of-stock' : ''}`}
                onClick={() => console.log('Selected item:', item)}
            >
                <div className="item-header">
                    <h4 className={`item-name item-name--${item.rarity}`}>
                        {item.name}
                    </h4>
                    <div className="item-price">
                        {item.finalPrice} <span className="gold-icon">🪙</span>
                    </div>
                </div>
                
                <div className="item-description">
                    {item.description}
                </div>
                
                {item.stats && (
                    <div className="item-stats">
                        {Object.entries(item.stats).map(([stat, value]) => (
                            <span key={stat} className="stat">
                                {stat}: +{value}
                            </span>
                        ))}
                    </div>
                )}
                
                <div className="item-footer">
                    <div className="item-info">
                        <span className={`item-type item-type--${item.type}`}>
                            {item.type}
                        </span>
                        <span className="item-stock">
                            {item.quantity === -1 ? '∞' : item.quantity} en stock
                        </span>
                    </div>
                    
                    <div className="item-actions">
                        {cartQuantity > 0 && (
                            <span className="cart-quantity">
                                {cartQuantity} dans le panier
                            </span>
                        )}
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                            }}
                            disabled={!canAfford || !inStock}
                        >
                            +1
                        </button>
                        {cartQuantity > 0 && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(item, -1);
                                }}
                            >
                                -1
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [cart, playerGold, handleAddToCart]);

    // Rendu d'un item du joueur
    const renderPlayerItem = useCallback((item: PlayerItem) => {
        return (
            <div 
                key={item.itemId}
                className={`player-item ${item.equipped ? 'player-item--equipped' : ''}`}
                onClick={() => console.log('Selected item:', item)}
            >
                <div className="item-header">
                    <h4 className={`item-name item-name--${item.rarity}`}>
                        {item.name}
                        {item.equipped && <span className="equipped-indicator">⚡</span>}
                    </h4>
                    <div className="item-price">
                        {item.sellPrice} <span className="gold-icon">🪙</span>
                    </div>
                </div>
                
                <div className="item-description">
                    {item.description}
                </div>
                
                <div className="item-footer">
                    <div className="item-info">
                        <span className={`item-type item-type--${item.type}`}>
                            {item.type}
                        </span>
                        <span className="item-quantity">
                            Quantité: {item.quantity}
                        </span>
                    </div>
                    
                    <div className="item-actions">
                        <button
                            className="btn btn-warning btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSellItem(item);
                            }}
                            disabled={item.equipped}
                        >
                            Vendre
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [handleSellItem]);

    return (
        <div className="merchant-scene">
            {/* En-tête */}
            <div className="merchant-header">
                <div className="merchant-info">
                    <div className="merchant-portrait">
                        {scene.merchant.portrait ? (
                            <img src={scene.merchant.portrait} alt={scene.merchant.name} />
                        ) : (
                            <div className="portrait-placeholder">
                                {scene.merchant.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="merchant-details">
                        <h2>{scene.merchant.name}</h2>
                        {scene.merchant.greeting && (
                            <p className="merchant-greeting">"{scene.merchant.greeting}"</p>
                        )}
                    </div>
                </div>
                
                <div className="player-gold">
                    <span className="gold-amount">{playerGold}</span>
                    <span className="gold-icon">🪙</span>
                </div>
            </div>

            {/* Description */}
            {scene.description && (
                <div className="merchant-description">
                    <p>{scene.description}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="merchant-nav">
                <button
                    className={`nav-btn ${currentView === 'shop' ? 'nav-btn--active' : ''}`}
                    onClick={() => setCurrentView('shop')}
                >
                    🛒 Boutique
                </button>
                <button
                    className={`nav-btn ${currentView === 'inventory' ? 'nav-btn--active' : ''}`}
                    onClick={() => setCurrentView('inventory')}
                >
                    🎒 Mon Inventaire
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="merchant-filters">
                <div className="filter-group">
                    <label>Recherche:</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Chercher un item..."
                        className="search-input"
                    />
                </div>
                
                <div className="filter-group">
                    <label>Type:</label>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tous</option>
                        <option value="weapon">Armes</option>
                        <option value="armor">Armures</option>
                        <option value="consumable">Consommables</option>
                        <option value="misc">Divers</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Trier par:</label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="name">Nom</option>
                        <option value="price">Prix</option>
                        <option value="type">Type</option>
                        <option value="rarity">Rareté</option>
                    </select>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="merchant-content">
                <div className="items-section">
                    {currentView === 'shop' ? (
                        <div className="shop-items">
                            {filteredShopItems.length === 0 ? (
                                <div className="no-items">
                                    Aucun item ne correspond à vos critères
                                </div>
                            ) : (
                                filteredShopItems.map(renderShopItem)
                            )}
                        </div>
                    ) : (
                        <div className="player-items">
                            {filteredPlayerItems.length === 0 ? (
                                <div className="no-items">
                                    Aucun item dans votre inventaire
                                </div>
                            ) : (
                                filteredPlayerItems.map(renderPlayerItem)
                            )}
                        </div>
                    )}
                </div>

                {/* Panier d'achat */}
                {currentView === 'shop' && cart.size > 0 && (
                    <div className="cart-section">
                        <h3>Panier ({cart.size} items)</h3>
                        <div className="cart-items">
                            {Array.from(cart.entries()).map(([itemId, quantity]) => {
                                const item = shopItems.find(i => i.itemId === itemId);
                                if (!item) return null;
                                
                                return (
                                    <div key={itemId} className="cart-item">
                                        <span className="cart-item-name">{item.name}</span>
                                        <span className="cart-item-quantity">x{quantity}</span>
                                        <span className="cart-item-price">
                                            {item.finalPrice * quantity} 🪙
                                        </span>
                                        <button
                                            className="btn btn-danger btn-xs"
                                            onClick={() => handleRemoveFromCart(itemId)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="cart-total">
                            <strong>Total: {cartTotal} 🪙</strong>
                        </div>
                        
                        <button
                            className="btn btn-success btn-large"
                            onClick={handlePurchase}
                            disabled={cartTotal > playerGold}
                        >
                            {cartTotal > playerGold ? 'Fonds insuffisants' : 'Acheter'}
                        </button>
                    </div>
                )}
            </div>

            {/* Actions de sortie */}
            <div className="merchant-actions">
                {scene.choices.map(choice => (
                    <button
                        key={choice.id}
                        className="btn btn-primary"
                        onClick={() => handleExit(choice.id)}
                    >
                        {choice.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Fonctions utilitaires simulées (TODO: remplacer par vraie DB)
function getItemBasePrice(itemId: string): number {
    const prices: Record<string, number> = {
        'sword_iron': 50,
        'sword_steel': 100,
        'potion_health': 25,
        'potion_mana': 30,
        'armor_leather': 75,
        'shield_wooden': 20
    };
    return prices[itemId] || 10;
}

function getItemName(itemId: string): string {
    const names: Record<string, string> = {
        'sword_iron': 'Épée en Fer',
        'sword_steel': 'Épée en Acier',
        'potion_health': 'Potion de Soins',
        'potion_mana': 'Potion de Mana',
        'armor_leather': 'Armure de Cuir',
        'shield_wooden': 'Bouclier en Bois'
    };
    return names[itemId] || itemId;
}

function getItemDescription(itemId: string): string {
    const descriptions: Record<string, string> = {
        'sword_iron': 'Une épée solide forgée dans le fer.',
        'sword_steel': 'Une épée de qualité supérieure en acier trempé.',
        'potion_health': 'Restaure 50 points de vie.',
        'potion_mana': 'Restaure 30 points de mana.',
        'armor_leather': 'Protection basique mais flexible.',
        'shield_wooden': 'Un bouclier simple mais efficace.'
    };
    return descriptions[itemId] || 'Description non disponible';
}

function getItemType(itemId: string): ShopItem['type'] {
    if (itemId.includes('sword') || itemId.includes('weapon')) return 'weapon';
    if (itemId.includes('armor') || itemId.includes('shield')) return 'armor';
    if (itemId.includes('potion')) return 'consumable';
    return 'misc';
}

function getItemRarity(itemId: string): ShopItem['rarity'] {
    if (itemId.includes('steel') || itemId.includes('magic')) return 'uncommon';
    if (itemId.includes('enchanted')) return 'rare';
    return 'common';
}

function getItemStats(itemId: string): Record<string, number> | undefined {
    const stats: Record<string, Record<string, number>> = {
        'sword_iron': { attack: 8 },
        'sword_steel': { attack: 12 },
        'armor_leather': { defense: 3 },
        'shield_wooden': { defense: 2 }
    };
    return stats[itemId];
}

export default MerchantSceneRenderer;