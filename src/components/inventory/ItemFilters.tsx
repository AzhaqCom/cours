
interface ItemFiltersProps {
    filters: {
        search: string;
        type: string;
        rarity: string;
        equipped: string;
    };
    onFiltersChange: (filters: ItemFiltersProps['filters']) => void;
}

export function ItemFilters({ filters, onFiltersChange }: ItemFiltersProps) {
    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            search: '',
            type: 'all',
            rarity: 'all',
            equipped: 'all'
        });
    };

    const hasActiveFilters = () => {
        return filters.search !== '' || 
               filters.type !== 'all' || 
               filters.rarity !== 'all' || 
               filters.equipped !== 'all';
    };

    return (
        <div className="item-filters">
            <div className="filters-header">
                <h5>🔍 Filtres</h5>
                {hasActiveFilters() && (
                    <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        title="Effacer tous les filtres"
                    >
                        ✕ Effacer
                    </button>
                )}
            </div>

            <div className="filters-grid">
                {/* Recherche par nom */}
                <div className="filter-group">
                    <label className="filter-label">
                        <span className="label-icon">📝</span>
                        <span className="label-text">Rechercher</span>
                    </label>
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="filter-input filter-search"
                            placeholder="Nom de l'objet..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        {filters.search && (
                            <button
                                className="clear-search-btn"
                                onClick={() => handleFilterChange('search', '')}
                                title="Effacer la recherche"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtre par type */}
                <div className="filter-group">
                    <label className="filter-label">
                        <span className="label-icon">📦</span>
                        <span className="label-text">Type</span>
                    </label>
                    <select
                        className="filter-select"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="all">🌟 Tous les types</option>
                        <option value="weapon">⚔️ Armes</option>
                        <option value="armor">🛡️ Armures</option>
                        <option value="consumable">🧪 Consommables</option>
                        <option value="accessory">💎 Accessoires</option>
                        <option value="misc">📦 Divers</option>
                    </select>
                </div>

                {/* Filtre par rareté */}
                <div className="filter-group">
                    <label className="filter-label">
                        <span className="label-icon">⭐</span>
                        <span className="label-text">Rareté</span>
                    </label>
                    <select
                        className="filter-select"
                        value={filters.rarity}
                        onChange={(e) => handleFilterChange('rarity', e.target.value)}
                    >
                        <option value="all">🌟 Toutes les raretés</option>
                        <option value="common" className="rarity-common">⚪ Commun</option>
                        <option value="uncommon" className="rarity-uncommon">🟢 Peu commun</option>
                        <option value="rare" className="rarity-rare">🔵 Rare</option>
                        <option value="epic" className="rarity-epic">🟣 Épique</option>
                        <option value="legendary" className="rarity-legendary">🟠 Légendaire</option>
                    </select>
                </div>

                {/* Filtre par statut d'équipement */}
                <div className="filter-group">
                    <label className="filter-label">
                        <span className="label-icon">⚔️</span>
                        <span className="label-text">Statut</span>
                    </label>
                    <select
                        className="filter-select"
                        value={filters.equipped}
                        onChange={(e) => handleFilterChange('equipped', e.target.value)}
                    >
                        <option value="all">🌟 Tous les objets</option>
                        <option value="equipped">⚔️ Équipés</option>
                        <option value="unequipped">📦 Non équipés</option>
                    </select>
                </div>
            </div>

            {/* Raccourcis de filtrage */}
            <div className="filter-shortcuts">
                <div className="shortcuts-header">
                    <span className="shortcuts-icon">⚡</span>
                    <span className="shortcuts-text">Raccourcis</span>
                </div>
                <div className="shortcuts-grid">
                    <button
                        className={`shortcut-btn ${filters.type === 'weapon' ? 'shortcut-btn--active' : ''}`}
                        onClick={() => handleFilterChange('type', filters.type === 'weapon' ? 'all' : 'weapon')}
                    >
                        ⚔️ Armes
                    </button>
                    <button
                        className={`shortcut-btn ${filters.type === 'consumable' ? 'shortcut-btn--active' : ''}`}
                        onClick={() => handleFilterChange('type', filters.type === 'consumable' ? 'all' : 'consumable')}
                    >
                        🧪 Potions
                    </button>
                    <button
                        className={`shortcut-btn ${filters.rarity === 'rare' ? 'shortcut-btn--active' : ''}`}
                        onClick={() => handleFilterChange('rarity', filters.rarity === 'rare' ? 'all' : 'rare')}
                    >
                        🔵 Rare+
                    </button>
                    <button
                        className={`shortcut-btn ${filters.equipped === 'unequipped' ? 'shortcut-btn--active' : ''}`}
                        onClick={() => handleFilterChange('equipped', filters.equipped === 'unequipped' ? 'all' : 'unequipped')}
                    >
                        📦 Libres
                    </button>
                </div>
            </div>

            {/* Statistiques des filtres */}
            <div className="filter-stats">
                <div className="stats-info">
                    <span className="stats-icon">📊</span>
                    <span className="stats-text">
                        {hasActiveFilters() ? 'Filtres actifs' : 'Aucun filtre'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ItemFilters;