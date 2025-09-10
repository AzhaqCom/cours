import { create } from 'zustand';
import type { Companion } from '../types/Companion';
import type { InventoryItem } from '../components/inventory/InventoryPanel';
import { EquipmentManager } from '../systems/EquipmentManager';

// Types pour la progression des compagnons
export interface CompanionProgression {
    level: number;
    xp: number;
    xpToNext: number;
    skillPoints: number;
    attributePoints: number;
}

// Types pour l'IA des compagnons
export interface CompanionAISettings {
    aggressiveness: 'defensive' | 'balanced' | 'aggressive';
    useSpells: boolean;
    useItems: boolean;
    followPlayer: boolean;
    protectAllies: boolean;
    targetPriority: 'weakest' | 'strongest' | 'nearest' | 'caster';
}

// Compagnon étendu avec toutes les données
export interface ExtendedCompanion extends Omit<Companion, 'inventory'> {
    // Identifiants
    id: string;
    name: string;
    
    // Progression
    progression: CompanionProgression;
    
    // Inventaire et équipement (remplace celui de Companion)
    inventory: InventoryItem[]; // On utilise le type étendu au lieu de CompanionInventoryItem
    equipmentManager: EquipmentManager;
    
    // IA et comportement
    aiSettings: CompanionAISettings;
    
    // État
    isActive: boolean; // Si le compagnon est avec le joueur
    isAlive: boolean;
    currentHp: number;
    
    // Relations
    loyalty: number; // 0-100
    relationship: 'hostile' | 'neutral' | 'friendly' | 'ally' | 'devoted';
    
    // Histoire et dialogue
    backstory: string;
    currentQuest?: string;
    personalityTraits: string[];
    
    // Timestamps
    acquiredAt: number;
    lastLevelUp: number;
}

// État du store companions
interface CompanionStoreState {
    // Compagnons
    companions: Map<string, ExtendedCompanion>;
    activeCompanions: string[]; // Max 4 compagnons actifs
    maxActiveCompanions: number;
    
    // UI
    selectedCompanionId: string | null;
    showCompanionPanel: boolean;
    companionPanelTab: 'stats' | 'inventory' | 'ai' | 'progression';
    
    // Statistiques
    totalCompanionsRecruited: number;
    companionsLost: number;
    
    // Actions - Companion Management
    addCompanion: (companionData: Partial<ExtendedCompanion>) => string;
    removeCompanion: (companionId: string) => boolean;
    activateCompanion: (companionId: string) => boolean;
    deactivateCompanion: (companionId: string) => boolean;
    
    // Actions - Progression
    giveXPToCompanion: (companionId: string, xp: number) => boolean;
    levelUpCompanion: (companionId: string) => boolean;
    allocateSkillPoint: (companionId: string, skill: string) => boolean;
    allocateAttributePoint: (companionId: string, attribute: keyof Companion['stats']) => boolean;
    
    // Actions - Equipment & Inventory
    giveItemToCompanion: (companionId: string, item: InventoryItem) => boolean;
    takeItemFromCompanion: (companionId: string, itemId: string) => InventoryItem | null;
    equipItemOnCompanion: (companionId: string, itemId: string, slot: string) => boolean;
    unequipItemFromCompanion: (companionId: string, slot: string) => boolean;
    autoEquipCompanion: (companionId: string) => void;
    
    // Actions - AI Management
    updateCompanionAI: (companionId: string, settings: Partial<CompanionAISettings>) => boolean;
    setCompanionBehavior: (companionId: string, behavior: CompanionAISettings['aggressiveness']) => boolean;
    
    // Actions - Relationship
    modifyLoyalty: (companionId: string, amount: number) => void;
    updateRelationship: (companionId: string) => void;
    
    // Actions - UI
    selectCompanion: (companionId: string | null) => void;
    toggleCompanionPanel: () => void;
    setCompanionPanelTab: (tab: CompanionStoreState['companionPanelTab']) => void;
    
    // Getters
    getCompanion: (companionId: string) => ExtendedCompanion | null;
    getActiveCompanions: () => ExtendedCompanion[];
    getAvailableCompanions: () => ExtendedCompanion[];
    getCompanionsByLevel: () => ExtendedCompanion[];
    canAddMoreCompanions: () => boolean;
    getTotalPartyLevel: () => number;
    getPartyComposition: () => {
        tanks: number;
        dps: number;
        healers: number;
        support: number;
    };
    
    // Utilities
    healAllCompanions: () => void;
    restoreAllCompanionResources: () => void;
    dismissAllCompanions: () => void;
    getCompanionRecommendations: () => string[];
}

// XP requis par niveau (même table que le joueur)
const COMPANION_XP_TABLE: Record<number, number> = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
    6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
    11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
    16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
};

export const useCompanionStore = create<CompanionStoreState>((set, get) => ({
    // État initial
    companions: new Map(),
    activeCompanions: [],
    maxActiveCompanions: 4,
    
    selectedCompanionId: null,
    showCompanionPanel: false,
    companionPanelTab: 'stats',
    
    totalCompanionsRecruited: 0,
    companionsLost: 0,

    // === COMPANION MANAGEMENT ===

    addCompanion: (companionData) => {
        const state = get();
        const companionId = `companion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Créer le compagnon avec des valeurs par défaut
        const newCompanion: ExtendedCompanion = {
            // Données de base
            id: companionId,
            name: companionData.name || 'Compagnon Sans Nom',
            level: companionData.level || 1,
            xp: companionData.xp || 0,
            
            // Stats de base (à partir de CombatEntity)
            maxHp: companionData.maxHp || 50,
            ac: companionData.ac || 12,
            movement: companionData.movement || 6,
            stats: companionData.stats || {
                strength: 12,
                dexterity: 12,
                constitution: 12,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            },
            weaponIds: companionData.weaponIds || ['sword_basic'],
            attackBonus: companionData.attackBonus || 2,
            damageBonus: companionData.damageBonus || 1,
            aiRole: companionData.aiRole || 'tank',
            aiPriorities: companionData.aiPriorities || ['defend', 'melee_attack'],
            image: companionData.image || 'companion-default.png',
            
            // Progression
            progression: {
                level: companionData.level || 1,
                xp: companionData.xp || 0,
                xpToNext: COMPANION_XP_TABLE[(companionData.level || 1) + 1] || 999999,
                skillPoints: 0,
                attributePoints: 0
            },
            
            // Inventaire
            inventory: companionData.inventory || [],
            equipmentManager: new EquipmentManager({
                name: companionData.name || 'Compagnon',
                level: companionData.level || 1,
                class: 'Fighter', // Par défaut
                hp: companionData.maxHp || 50,
                maxHp: companionData.maxHp || 50,
                currentXP: companionData.xp || 0,
                inventory: [],
                spells: [],
                stats: companionData.stats || {
                    strength: 12, dexterity: 12, constitution: 12,
                    intelligence: 10, wisdom: 10, charisma: 10
                },
                armorClass: companionData.ac || 12
            }),
            
            // IA
            aiSettings: {
                aggressiveness: 'balanced',
                useSpells: true,
                useItems: true,
                followPlayer: true,
                protectAllies: true,
                targetPriority: 'nearest'
            },
            
            // État
            isActive: false,
            isAlive: true,
            currentHp: companionData.maxHp || 50,
            
            // Relations
            loyalty: 50,
            relationship: 'neutral',
            
            // Histoire
            backstory: companionData.backstory || 'Un compagnon mystérieux.',
            personalityTraits: companionData.personalityTraits || ['Loyal', 'Courageux'],
            
            // Progression path (de Companion)
            progressionPath: companionData.progressionPath || 'warrior',
            
            // Equipped
            equipped: companionData.equipped || {
                mainHand: undefined,
                offHand: undefined,
                armor: undefined,
                accessory: undefined
            },
            
            // Timestamps
            acquiredAt: Date.now(),
            lastLevelUp: Date.now(),
            
            // Propriétés manquantes de Companion
            relationshipLevel: 1,
            recruited: true
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, newCompanion);

        set({
            companions: newCompanions,
            totalCompanionsRecruited: state.totalCompanionsRecruited + 1
        });

        console.log('➕ Compagnon ajouté:', newCompanion.name, `(ID: ${companionId})`);
        return companionId;
    },

    removeCompanion: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        const newCompanions = new Map(state.companions);
        newCompanions.delete(companionId);

        set({
            companions: newCompanions,
            activeCompanions: state.activeCompanions.filter(id => id !== companionId),
            selectedCompanionId: state.selectedCompanionId === companionId ? null : state.selectedCompanionId,
            companionsLost: state.companionsLost + 1
        });

        console.log('➖ Compagnon retiré:', companion.name);
        return true;
    },

    activateCompanion: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion || companion.isActive || !companion.isAlive) {
            return false;
        }

        if (state.activeCompanions.length >= state.maxActiveCompanions) {
            console.warn('⚠️ Trop de compagnons actifs');
            return false;
        }

        // Activer le compagnon
        const updatedCompanion = { ...companion, isActive: true };
        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({
            companions: newCompanions,
            activeCompanions: [...state.activeCompanions, companionId]
        });

        console.log('✅ Compagnon activé:', companion.name);
        return true;
    },

    deactivateCompanion: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion || !companion.isActive) {
            return false;
        }

        const updatedCompanion = { ...companion, isActive: false };
        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({
            companions: newCompanions,
            activeCompanions: state.activeCompanions.filter(id => id !== companionId)
        });

        console.log('❌ Compagnon désactivé:', companion.name);
        return true;
    },

    // === PROGRESSION ===

    giveXPToCompanion: (companionId, xp) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        const newXP = companion.progression.xp + xp;
        const nextLevelXP = COMPANION_XP_TABLE[companion.progression.level + 1];
        
        const updatedProgression = {
            ...companion.progression,
            xp: newXP,
            xpToNext: nextLevelXP ? nextLevelXP - newXP : 0
        };

        const updatedCompanion = {
            ...companion,
            xp: newXP,
            progression: updatedProgression
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        // Auto level-up si suffisamment d'XP
        if (nextLevelXP && newXP >= nextLevelXP) {
            get().levelUpCompanion(companionId);
        }

        console.log(`📈 ${companion.name} gagne ${xp} XP (Total: ${newXP})`);
        return true;
    },

    levelUpCompanion: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion || companion.progression.level >= 20) {
            return false;
        }

        const newLevel = companion.progression.level + 1;
        const xpRequired = COMPANION_XP_TABLE[newLevel];
        
        if (companion.progression.xp < xpRequired) {
            return false;
        }

        // Calculer l'amélioration des stats
        const hpIncrease = Math.floor(Math.random() * 8) + 3; // 3-10 HP
        
        const updatedProgression = {
            ...companion.progression,
            level: newLevel,
            xpToNext: COMPANION_XP_TABLE[newLevel + 1] ? COMPANION_XP_TABLE[newLevel + 1] - companion.progression.xp : 0,
            skillPoints: companion.progression.skillPoints + 2,
            attributePoints: companion.progression.attributePoints + 1
        };

        const updatedCompanion = {
            ...companion,
            level: newLevel,
            maxHp: companion.maxHp + hpIncrease,
            currentHp: companion.currentHp + hpIncrease,
            progression: updatedProgression,
            lastLevelUp: Date.now()
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        console.log(`🎉 ${companion.name} passe niveau ${newLevel}! (+${hpIncrease} HP)`);
        return true;
    },

    allocateSkillPoint: (companionId, skill) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion || companion.progression.skillPoints <= 0) {
            return false;
        }

        const updatedProgression = {
            ...companion.progression,
            skillPoints: companion.progression.skillPoints - 1
        };

        // TODO: Intégrer avec système de compétences
        console.log(`🎯 ${companion.name} améliore ${skill}`);

        const updatedCompanion = {
            ...companion,
            progression: updatedProgression
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });
        return true;
    },

    allocateAttributePoint: (companionId, attribute) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion || companion.progression.attributePoints <= 0) {
            return false;
        }

        const updatedStats = {
            ...companion.stats,
            [attribute]: companion.stats[attribute] + 1
        };

        const updatedProgression = {
            ...companion.progression,
            attributePoints: companion.progression.attributePoints - 1
        };

        const updatedCompanion = {
            ...companion,
            stats: updatedStats,
            progression: updatedProgression
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        console.log(`💪 ${companion.name} améliore ${attribute} (${updatedStats[attribute]})`);
        return true;
    },

    // === EQUIPMENT & INVENTORY ===

    giveItemToCompanion: (companionId, item) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        const updatedInventory = [...companion.inventory, { ...item, id: `item-${Date.now()}-${Math.random()}` }];
        const updatedCompanion = {
            ...companion,
            inventory: updatedInventory
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        console.log(`📦 ${item.name} donné à ${companion.name}`);
        return true;
    },

    takeItemFromCompanion: (companionId, itemId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return null;
        }

        const itemIndex = companion.inventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            return null;
        }

        const item = companion.inventory[itemIndex];
        const updatedInventory = companion.inventory.filter(item => item.id !== itemId);
        
        const updatedCompanion = {
            ...companion,
            inventory: updatedInventory
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        console.log(`📤 ${item.name} pris de ${companion.name}`);
        return item;
    },

    equipItemOnCompanion: (companionId, itemId, _slot) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        const item = companion.inventory.find(item => item.id === itemId);
        if (!item || !item.equipSlot) {
            return false;
        }

        return companion.equipmentManager.equipItem(item, item.equipSlot as any);
    },

    unequipItemFromCompanion: (companionId, slot) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        return companion.equipmentManager.unequipItem(slot as any);
    },

    autoEquipCompanion: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return;
        }

        companion.equipmentManager.autoEquipBest(companion.inventory);
        console.log(`🤖 Auto-équipement de ${companion.name}`);
    },

    // === AI MANAGEMENT ===

    updateCompanionAI: (companionId, settings) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return false;
        }

        const updatedAISettings = {
            ...companion.aiSettings,
            ...settings
        };

        const updatedCompanion = {
            ...companion,
            aiSettings: updatedAISettings
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        console.log(`🧠 IA de ${companion.name} mise à jour`);
        return true;
    },

    setCompanionBehavior: (companionId, behavior) => {
        return get().updateCompanionAI(companionId, { aggressiveness: behavior });
    },

    // === RELATIONSHIP ===

    modifyLoyalty: (companionId, amount) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return;
        }

        const newLoyalty = Math.max(0, Math.min(100, companion.loyalty + amount));
        const updatedCompanion = {
            ...companion,
            loyalty: newLoyalty
        };

        const newCompanions = new Map(state.companions);
        newCompanions.set(companionId, updatedCompanion);

        set({ companions: newCompanions });

        // Mettre à jour la relation
        get().updateRelationship(companionId);
    },

    updateRelationship: (companionId) => {
        const state = get();
        const companion = state.companions.get(companionId);
        
        if (!companion) {
            return;
        }

        let newRelationship: ExtendedCompanion['relationship'] = 'neutral';
        
        if (companion.loyalty >= 80) newRelationship = 'devoted';
        else if (companion.loyalty >= 60) newRelationship = 'ally';
        else if (companion.loyalty >= 40) newRelationship = 'friendly';
        else if (companion.loyalty >= 20) newRelationship = 'neutral';
        else newRelationship = 'hostile';

        if (newRelationship !== companion.relationship) {
            const updatedCompanion = {
                ...companion,
                relationship: newRelationship
            };

            const newCompanions = new Map(state.companions);
            newCompanions.set(companionId, updatedCompanion);

            set({ companions: newCompanions });

            console.log(`💖 ${companion.name} devient ${newRelationship}`);
        }
    },

    // === UI ===

    selectCompanion: (companionId) => {
        set({ selectedCompanionId: companionId });
    },

    toggleCompanionPanel: () => {
        const state = get();
        set({ showCompanionPanel: !state.showCompanionPanel });
    },

    setCompanionPanelTab: (tab) => {
        set({ companionPanelTab: tab });
    },

    // === GETTERS ===

    getCompanion: (companionId) => {
        const state = get();
        return state.companions.get(companionId) || null;
    },

    getActiveCompanions: () => {
        const state = get();
        return state.activeCompanions
            .map(id => state.companions.get(id))
            .filter((c): c is ExtendedCompanion => c !== undefined);
    },

    getAvailableCompanions: () => {
        const state = get();
        return Array.from(state.companions.values())
            .filter(c => !c.isActive && c.isAlive);
    },

    getCompanionsByLevel: () => {
        const state = get();
        return Array.from(state.companions.values())
            .sort((a, b) => b.level - a.level);
    },

    canAddMoreCompanions: () => {
        const state = get();
        return state.activeCompanions.length < state.maxActiveCompanions;
    },

    getTotalPartyLevel: () => {
        const activeCompanions = get().getActiveCompanions();
        return activeCompanions.reduce((total, companion) => total + companion.level, 0);
    },

    getPartyComposition: () => {
        const activeCompanions = get().getActiveCompanions();
        const composition = { tanks: 0, dps: 0, healers: 0, support: 0 };
        
        activeCompanions.forEach(companion => {
            switch (companion.progressionPath) {
                case 'warrior':
                    composition.tanks++;
                    break;
                case 'mage':
                    if (companion.aiRole === 'caster') {
                        composition.dps++;
                    } else {
                        composition.support++;
                    }
                    break;
                case 'support':
                    composition.healers++;
                    break;
                default:
                    composition.dps++;
            }
        });

        return composition;
    },

    // === UTILITIES ===

    healAllCompanions: () => {
        const state = get();
        const newCompanions = new Map(state.companions);
        
        state.companions.forEach((companion) => {
            if (companion.isAlive && companion.currentHp < companion.maxHp) {
                newCompanions.set(companion.id, {
                    ...companion,
                    currentHp: companion.maxHp
                });
            }
        });

        set({ companions: newCompanions });
        console.log('💚 Tous les compagnons soignés');
    },

    restoreAllCompanionResources: () => {
        // TODO: Restaurer sorts, objets spéciaux, etc.
        console.log('🔮 Ressources des compagnons restaurées');
    },

    dismissAllCompanions: () => {
        const state = get();
        const newCompanions = new Map(state.companions);
        
        state.activeCompanions.forEach(companionId => {
            const companion = newCompanions.get(companionId);
            if (companion) {
                newCompanions.set(companionId, {
                    ...companion,
                    isActive: false
                });
            }
        });

        set({
            companions: newCompanions,
            activeCompanions: []
        });

        console.log('👋 Tous les compagnons renvoyés');
    },

    getCompanionRecommendations: () => {
        const activeCompanions = get().getActiveCompanions();
        const composition = get().getPartyComposition();
        const recommendations: string[] = [];

        // Analyser la composition actuelle
        if (composition.tanks === 0) {
            recommendations.push('Recruter un tank (guerrier/paladin)');
        }
        if (composition.healers === 0) {
            recommendations.push('Recruter un soigneur (clerc/druide)');
        }
        if (composition.dps < 2) {
            recommendations.push('Recruter plus de DPS (mage/roublard)');
        }

        // Analyser les niveaux
        const avgLevel = activeCompanions.length > 0 
            ? get().getTotalPartyLevel() / activeCompanions.length 
            : 1;
        
        if (activeCompanions.some(c => c.level < avgLevel - 2)) {
            recommendations.push('Certains compagnons ont pris du retard en niveau');
        }

        return recommendations;
    }
}));

// Hooks utilitaires
export const useActiveCompanions = () => {
    const getActiveCompanions = useCompanionStore(state => state.getActiveCompanions);
    return getActiveCompanions();
};

export const usePartyComposition = () => {
    const getPartyComposition = useCompanionStore(state => state.getPartyComposition);
    return getPartyComposition();
};

export const useCompanionRecommendations = () => {
    const getCompanionRecommendations = useCompanionStore(state => state.getCompanionRecommendations);
    return getCompanionRecommendations();
};

export default useCompanionStore;