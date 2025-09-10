import { create } from 'zustand';
import type { CombatScene } from '../types/Scene';
import type { CombatActionResult } from '../systems/combat/CombatManager';
import type { CombatEntityInstance } from '../types/CombatEntity';
import type { Action, ActionType } from '../systems/combat/Actions';
import type { Position } from '../systems/combat/Grid';

// Types pour l'historique des actions
export interface CombatActionHistory {
    id: string;
    entityId: string;
    action: Action;
    result: CombatActionResult;
    timestamp: number;
    turnNumber: number;
}

// Types pour les tours
export interface CombatTurn {
    entityId: string;
    initiative: number;
    hasActed: boolean;
    hasMoved: boolean;
    actionsRemaining: number;
}

// État du store combat
interface CombatStoreState {
    // État général du combat
    isInCombat: boolean;
    combatScene: CombatScene | null;
    combatPhase: 'setup' | 'initiative' | 'combat' | 'victory' | 'defeat';
    
    // Entités en combat
    allEntities: Map<string, CombatEntityInstance>;
    playerEntities: string[];
    companionEntities: string[];
    enemyEntities: string[];
    
    // Grille et positions
    gridWidth: number;
    gridHeight: number;
    entityPositions: Map<string, Position>;
    
    // Gestion des tours
    turnOrder: CombatTurn[];
    currentTurnIndex: number;
    currentEntityId: string | null;
    turnNumber: number;
    
    // Historique des actions
    actionHistory: CombatActionHistory[];
    
    // État UI
    selectedEntityId: string | null;
    hoveredPosition: Position | null;
    availableActions: ActionType[];
    validTargets: string[];
    validMovePositions: Position[];
    validAttackPositions: Position[];
    
    // Résultats de combat
    combatResult: 'none' | 'victory' | 'defeat';
    rewards: {
        xp: number;
        gold: number;
        items: string[];
    };

    // Actions - Combat Management
    initializeCombat: (
        scene: CombatScene,
        playerEntity: CombatEntityInstance,
        companions: CombatEntityInstance[],
        enemies: CombatEntityInstance[]
    ) => boolean;
    endCombat: (result: 'victory' | 'defeat') => void;
    resetCombat: () => void;
    
    // Actions - Turn Management
    rollInitiative: () => void;
    nextTurn: () => void;
    skipTurn: () => void;
    setCurrentEntity: (entityId: string) => void;
    
    // Actions - Entity Management
    updateEntity: (entityId: string, updates: Partial<CombatEntityInstance>) => void;
    removeEntity: (entityId: string) => void;
    addEntity: (entity: CombatEntityInstance) => void;
    
    // Actions - Position Management
    moveEntity: (entityId: string, position: Position) => boolean;
    getEntityPosition: (entityId: string) => Position | null;
    getEntityAt: (position: Position) => string | null;
    isPositionOccupied: (position: Position) => boolean;
    
    // Actions - Action Management
    executeAction: (action: Action) => CombatActionResult;
    addActionToHistory: (action: Action, result: CombatActionResult) => void;
    undoLastAction: () => boolean;
    
    // Actions - UI Management
    setSelectedEntity: (entityId: string | null) => void;
    setHoveredPosition: (position: Position | null) => void;
    updateAvailableActions: (entityId: string) => void;
    updateValidTargets: (actionType: ActionType) => void;
    updateValidPositions: (actionType: ActionType) => void;
    
    // Getters
    getCurrentEntity: () => CombatEntityInstance | null;
    getEntity: (entityId: string) => CombatEntityInstance | null;
    getEntitiesInRange: (position: Position, range: number) => CombatEntityInstance[];
    isPlayerTurn: () => boolean;
    isEntityAlive: (entityId: string) => boolean;
    getCombatStatistics: () => {
        totalEntities: number;
        aliveEntities: number;
        deadEntities: number;
        playerAlive: number;
        enemiesAlive: number;
    };
}

export const useCombatStore = create<CombatStoreState>((set, get) => ({
    // État initial
    isInCombat: false,
    combatScene: null,
    combatPhase: 'setup',
    
    allEntities: new Map(),
    playerEntities: [],
    companionEntities: [],
    enemyEntities: [],
    
    gridWidth: 8,
    gridHeight: 6,
    entityPositions: new Map(),
    
    turnOrder: [],
    currentTurnIndex: 0,
    currentEntityId: null,
    turnNumber: 1,
    
    actionHistory: [],
    
    selectedEntityId: null,
    hoveredPosition: null,
    availableActions: [],
    validTargets: [],
    validMovePositions: [],
    validAttackPositions: [],
    
    combatResult: 'none',
    rewards: { xp: 0, gold: 0, items: [] },

    // === COMBAT MANAGEMENT ===

    initializeCombat: (scene, playerEntity, companions, enemies) => {
        try {
            const allEntities = new Map<string, CombatEntityInstance>();
            const entityPositions = new Map<string, Position>();
            
            // Ajouter le joueur
            allEntities.set(playerEntity.instanceId, playerEntity);
            entityPositions.set(playerEntity.instanceId, playerEntity.position);
            
            // Ajouter les compagnons
            companions.forEach(companion => {
                allEntities.set(companion.instanceId, companion);
                entityPositions.set(companion.instanceId, companion.position);
            });
            
            // Ajouter les ennemis
            enemies.forEach(enemy => {
                allEntities.set(enemy.instanceId, enemy);
                entityPositions.set(enemy.instanceId, enemy.position);
            });

            set({
                isInCombat: true,
                combatScene: scene,
                combatPhase: 'initiative',
                allEntities,
                playerEntities: [playerEntity.instanceId],
                companionEntities: companions.map(c => c.instanceId),
                enemyEntities: enemies.map(e => e.instanceId),
                gridWidth: scene.combat.gridSize.width,
                gridHeight: scene.combat.gridSize.height,
                entityPositions,
                turnNumber: 1,
                actionHistory: [],
                combatResult: 'none'
            });

            // Lancer l'initiative
            get().rollInitiative();
            
            console.log('✅ Combat initialisé:', {
                scene: scene.id,
                entities: allEntities.size,
                grid: `${scene.combat.gridSize.width}x${scene.combat.gridSize.height}`
            });
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du combat:', error);
            return false;
        }
    },

    endCombat: (result) => {
        const state = get();
        
        // Calculer les récompenses
        let xpReward = 0;
        let goldReward = 0;
        const itemRewards: string[] = [];
        
        if (result === 'victory') {
            // XP basée sur les ennemis vaincus
            state.enemyEntities.forEach(enemyId => {
                const enemy = state.allEntities.get(enemyId);
                if (enemy && enemy.entity.level) {
                    xpReward += enemy.entity.level * 50; // 50 XP par niveau d'ennemi
                }
            });
            
            // Or aléatoire
            goldReward = Math.floor(Math.random() * 100) + 50;
            
            // Items aléatoires (TODO: système plus sophistiqué)
            if (Math.random() > 0.7) {
                itemRewards.push('potion_health');
            }
        }

        set({
            combatPhase: result,
            combatResult: result,
            rewards: {
                xp: xpReward,
                gold: goldReward,
                items: itemRewards
            }
        });

        console.log(`🏁 Combat terminé: ${result}`, {
            xp: xpReward,
            gold: goldReward,
            items: itemRewards
        });
    },

    resetCombat: () => {
        set({
            isInCombat: false,
            combatScene: null,
            combatPhase: 'setup',
            allEntities: new Map(),
            playerEntities: [],
            companionEntities: [],
            enemyEntities: [],
            entityPositions: new Map(),
            turnOrder: [],
            currentTurnIndex: 0,
            currentEntityId: null,
            turnNumber: 1,
            actionHistory: [],
            selectedEntityId: null,
            hoveredPosition: null,
            availableActions: [],
            validTargets: [],
            validMovePositions: [],
            validAttackPositions: [],
            combatResult: 'none',
            rewards: { xp: 0, gold: 0, items: [] }
        });
        console.log('🔄 Combat réinitialisé');
    },

    // === TURN MANAGEMENT ===

    rollInitiative: () => {
        const state = get();
        const turnOrder: CombatTurn[] = [];
        
        state.allEntities.forEach((entity) => {
            if (entity.isAlive) {
                const initiativeRoll = Math.floor(Math.random() * 20) + 1;
                const dexModifier = Math.floor((entity.entity.stats.dexterity - 10) / 2);
                const totalInitiative = initiativeRoll + dexModifier;
                
                turnOrder.push({
                    entityId: entity.instanceId,
                    initiative: totalInitiative,
                    hasActed: false,
                    hasMoved: false,
                    actionsRemaining: 1
                });
            }
        });
        
        // Trier par initiative décroissante
        turnOrder.sort((a, b) => b.initiative - a.initiative);
        
        set({
            turnOrder,
            currentTurnIndex: 0,
            currentEntityId: turnOrder[0]?.entityId || null,
            combatPhase: 'combat'
        });
        
        console.log('🎲 Initiative lancée:', turnOrder.map(t => 
            `${t.entityId}: ${t.initiative}`
        ));
    },

    nextTurn: () => {
        const state = get();
        let nextIndex = state.currentTurnIndex + 1;
        
        // Si on a fait le tour de tous les entités, nouveau tour
        if (nextIndex >= state.turnOrder.length) {
            nextIndex = 0;
            // Reset des actions pour le nouveau tour
            const newTurnOrder = state.turnOrder.map(turn => ({
                ...turn,
                hasActed: false,
                hasMoved: false,
                actionsRemaining: 1
            }));
            
            set({
                turnOrder: newTurnOrder,
                turnNumber: state.turnNumber + 1
            });
        }
        
        const nextEntity = state.turnOrder[nextIndex];
        
        set({
            currentTurnIndex: nextIndex,
            currentEntityId: nextEntity?.entityId || null
        });
        
        // Vérifier les conditions de victoire/défaite
        const checkCombatEnd = () => {
            const stats = get().getCombatStatistics();
            
            if (stats.playerAlive === 0) {
                get().endCombat('defeat');
            } else if (stats.enemiesAlive === 0) {
                get().endCombat('victory');
            }
        };
        
        checkCombatEnd();
    },

    skipTurn: () => {
        const state = get();
        const currentTurn = state.turnOrder[state.currentTurnIndex];
        
        if (currentTurn) {
            const newTurnOrder = [...state.turnOrder];
            newTurnOrder[state.currentTurnIndex] = {
                ...currentTurn,
                hasActed: true,
                actionsRemaining: 0
            };
            
            set({ turnOrder: newTurnOrder });
        }
        
        get().nextTurn();
    },

    setCurrentEntity: (entityId) => {
        const state = get();
        const turnIndex = state.turnOrder.findIndex(turn => turn.entityId === entityId);
        
        if (turnIndex >= 0) {
            set({
                currentTurnIndex: turnIndex,
                currentEntityId: entityId
            });
        }
    },

    // === ENTITY MANAGEMENT ===

    updateEntity: (entityId, updates) => {
        const state = get();
        const entity = state.allEntities.get(entityId);
        
        if (entity) {
            const updatedEntity = { ...entity, ...updates };
            const newEntities = new Map(state.allEntities);
            newEntities.set(entityId, updatedEntity);
            
            set({ allEntities: newEntities });
        }
    },

    removeEntity: (entityId) => {
        const state = get();
        const newEntities = new Map(state.allEntities);
        const newPositions = new Map(state.entityPositions);
        
        newEntities.delete(entityId);
        newPositions.delete(entityId);
        
        set({
            allEntities: newEntities,
            entityPositions: newPositions,
            playerEntities: state.playerEntities.filter(id => id !== entityId),
            companionEntities: state.companionEntities.filter(id => id !== entityId),
            enemyEntities: state.enemyEntities.filter(id => id !== entityId)
        });
    },

    addEntity: (entity) => {
        const state = get();
        const newEntities = new Map(state.allEntities);
        const newPositions = new Map(state.entityPositions);
        
        newEntities.set(entity.instanceId, entity);
        newPositions.set(entity.instanceId, entity.position);
        
        set({
            allEntities: newEntities,
            entityPositions: newPositions
        });
    },

    // === POSITION MANAGEMENT ===

    moveEntity: (entityId, position) => {
        const state = get();
        
        // Vérifier que la position est libre
        if (get().isPositionOccupied(position)) {
            return false;
        }
        
        // Vérifier les limites de la grille
        if (position.x < 0 || position.x >= state.gridWidth || 
            position.y < 0 || position.y >= state.gridHeight) {
            return false;
        }
        
        const newPositions = new Map(state.entityPositions);
        newPositions.set(entityId, position);
        
        // Mettre à jour l'entité
        const entity = state.allEntities.get(entityId);
        if (entity) {
            get().updateEntity(entityId, { position });
        }
        
        set({ entityPositions: newPositions });
        return true;
    },

    getEntityPosition: (entityId) => {
        const state = get();
        return state.entityPositions.get(entityId) || null;
    },

    getEntityAt: (position) => {
        const state = get();
        for (const [entityId, pos] of state.entityPositions.entries()) {
            if (pos.x === position.x && pos.y === position.y) {
                return entityId;
            }
        }
        return null;
    },

    isPositionOccupied: (position) => {
        return get().getEntityAt(position) !== null;
    },

    // === ACTION MANAGEMENT ===

    executeAction: (action) => {
        // TODO: Intégrer avec ActionSystem
        const result: CombatActionResult = {
            success: true,
            message: `Action ${action.type} exécutée`,
            damage: 0,
            effects: []
        };
        
        get().addActionToHistory(action, result);
        return result;
    },

    addActionToHistory: (action, result) => {
        const state = get();
        let entityId: string;
        if ('entityId' in action && typeof action.entityId === 'string') {
            entityId = action.entityId;
        } else {
            entityId = state.currentEntityId || 'unknown';
        }
        
        const historyEntry: CombatActionHistory = {
            id: `action-${Date.now()}-${Math.random()}`,
            entityId,
            action,
            result,
            timestamp: Date.now(),
            turnNumber: state.turnNumber
        };
        
        set({
            actionHistory: [...state.actionHistory, historyEntry]
        });
    },

    undoLastAction: () => {
        const state = get();
        if (state.actionHistory.length === 0) {
            return false;
        }
        
        // Retirer la dernière action
        const newHistory = [...state.actionHistory];
        const lastAction = newHistory.pop();
        
        set({ actionHistory: newHistory });
        
        console.log('↩️ Action annulée:', lastAction?.action.type);
        return true;
    },

    // === UI MANAGEMENT ===

    setSelectedEntity: (entityId) => {
        set({ selectedEntityId: entityId });
        
        if (entityId) {
            get().updateAvailableActions(entityId);
        } else {
            set({
                availableActions: [],
                validTargets: [],
                validMovePositions: [],
                validAttackPositions: []
            });
        }
    },

    setHoveredPosition: (position) => {
        set({ hoveredPosition: position });
    },

    updateAvailableActions: (entityId) => {
        const state = get();
        const entity = state.allEntities.get(entityId);
        const currentTurn = state.turnOrder.find(t => t.entityId === entityId);
        
        if (!entity || !currentTurn) {
            set({ availableActions: [] });
            return;
        }
        
        const actions: ActionType[] = [];
        
        // Actions de base toujours disponibles
        if (!currentTurn.hasMoved) {
            actions.push('move');
        }
        
        if (!currentTurn.hasActed) {
            actions.push('attack');
            if (entity.entity.spellIds && entity.entity.spellIds.length > 0) {
                actions.push('cast');
            }
            actions.push('defend');
        }
        
        set({ availableActions: actions });
    },

    updateValidTargets: (actionType) => {
        const state = get();
        const currentEntity = get().getCurrentEntity();
        
        if (!currentEntity) {
            set({ validTargets: [] });
            return;
        }
        
        let targets: string[] = [];
        
        switch (actionType) {
            case 'attack':
                targets = state.enemyEntities.filter(id => {
                    const entity = state.allEntities.get(id);
                    return entity && entity.isAlive;
                });
                break;
                
            case 'cast':
                // Dépend du sort - pour l'instant tous les ennemis
                targets = state.enemyEntities.filter(id => {
                    const entity = state.allEntities.get(id);
                    return entity && entity.isAlive;
                });
                break;
        }
        
        set({ validTargets: targets });
    },

    updateValidPositions: (actionType) => {
        const state = get();
        const currentEntity = get().getCurrentEntity();
        const currentPosition = currentEntity ? get().getEntityPosition(currentEntity.instanceId) : null;
        
        if (!currentEntity || !currentPosition) {
            set({ validMovePositions: [], validAttackPositions: [] });
            return;
        }
        
        if (actionType === 'move') {
            const validMoves: Position[] = [];
            const movement = currentEntity.entity.movement;
            
            for (let x = Math.max(0, currentPosition.x - movement); 
                 x <= Math.min(state.gridWidth - 1, currentPosition.x + movement); x++) {
                for (let y = Math.max(0, currentPosition.y - movement); 
                     y <= Math.min(state.gridHeight - 1, currentPosition.y + movement); y++) {
                    const pos = { x, y };
                    const distance = Math.abs(x - currentPosition.x) + Math.abs(y - currentPosition.y);
                    
                    if (distance <= movement && !get().isPositionOccupied(pos)) {
                        validMoves.push(pos);
                    }
                }
            }
            
            set({ validMovePositions: validMoves });
        }
    },

    // === GETTERS ===

    getCurrentEntity: () => {
        const state = get();
        return state.currentEntityId ? state.allEntities.get(state.currentEntityId) || null : null;
    },

    getEntity: (entityId) => {
        const state = get();
        return state.allEntities.get(entityId) || null;
    },

    getEntitiesInRange: (position, range) => {
        const state = get();
        const entitiesInRange: CombatEntityInstance[] = [];
        
        state.entityPositions.forEach((pos, entityId) => {
            const distance = Math.abs(pos.x - position.x) + Math.abs(pos.y - position.y);
            if (distance <= range) {
                const entity = state.allEntities.get(entityId);
                if (entity) {
                    entitiesInRange.push(entity);
                }
            }
        });
        
        return entitiesInRange;
    },

    isPlayerTurn: () => {
        const state = get();
        return state.currentEntityId ? state.playerEntities.includes(state.currentEntityId) : false;
    },

    isEntityAlive: (entityId) => {
        const state = get();
        const entity = state.allEntities.get(entityId);
        return entity ? entity.isAlive && entity.currentHp > 0 : false;
    },

    getCombatStatistics: () => {
        const state = get();
        const totalEntities = state.allEntities.size;
        const aliveEntities = Array.from(state.allEntities.values()).filter(e => e.isAlive).length;
        const deadEntities = totalEntities - aliveEntities;
        const playerAlive = state.playerEntities.filter(id => get().isEntityAlive(id)).length;
        const enemiesAlive = state.enemyEntities.filter(id => get().isEntityAlive(id)).length;
        
        return {
            totalEntities,
            aliveEntities,
            deadEntities,
            playerAlive,
            enemiesAlive
        };
    }
}));

// Hooks utilitaires pour l'accès rapide
export const useCurrentEntity = () => {
    const getCurrentEntity = useCombatStore(state => state.getCurrentEntity);
    return getCurrentEntity();
};

export const useIsPlayerTurn = () => {
    const isPlayerTurn = useCombatStore(state => state.isPlayerTurn);
    return isPlayerTurn();
};

export const useCombatStatistics = () => {
    const getCombatStatistics = useCombatStore(state => state.getCombatStatistics);
    return getCombatStatistics();
};

export default useCombatStore;