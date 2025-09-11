import { useState, useCallback, useRef } from 'react';
import type { CombatScene } from '../types/Scene';
import type { CombatState, CombatActionResult } from '../systems/combat/CombatManager';
import type { CombatEntityInstance, CombatEntity } from '../types/CombatEntity';
import type { Action, ActionType } from '../systems/combat/Actions';
import type { AIDecision } from '../systems/ai/AICore';
import { CombatManager } from '../systems/combat/CombatManager';
import { ActionSystem } from '../systems/combat/Actions';
import { CompanionAIManager } from '../systems/CompanionAI';
import { AIController } from '../systems/ai/AICore';
import { useInventoryStore } from '../store/inventoryStore';
import { useGameStore } from '../store/gameStore';
import { useCompanionStore } from '../store/companionStore';
import { SkirmisherBehavior, ArcherBehavior, TankBehavior, CasterBehavior, SupportBehavior } from '../systems/ai/Behaviors';
import { DataManager } from '../systems/DataManager';

// Hook personnalisé pour gérer toute la logique de combat
export function useCombat() {
    const [combatState, setCombatState] = useState<CombatState | null>(null);
    
    // Accès aux stores
    const { 
        equippedItems, 
        getEquippedStats
    } = useInventoryStore();
    const { 
        playerLevel, 
        playerCurrentHP, 
        playerMaxHP
    } = useGameStore();
    
    // Références aux gestionnaires (persistent entre re-renders)
    const combatManagerRef = useRef<CombatManager | null>(null);
    const actionSystemRef = useRef<ActionSystem | null>(null);
    const companionAIRef = useRef<CompanionAIManager | null>(null);
    const enemyAIRef = useRef<AIController | null>(null);

    // Initialiser le combat avec une scène
    const initializeCombat = useCallback(async (scene: CombatScene): Promise<boolean> => {
        try {
            // Créer les gestionnaires
            const combatManager = new CombatManager();
            const actionSystem = new ActionSystem(combatManager);
            const companionAI = new CompanionAIManager();
            const enemyAI = new AIController();

            // Configurer l'IA des ennemis
            enemyAI.registerEvaluator('skirmisher', new SkirmisherBehavior());
            enemyAI.registerEvaluator('archer', new ArcherBehavior());
            enemyAI.registerEvaluator('tank', new TankBehavior());
            enemyAI.registerEvaluator('caster', new CasterBehavior());
            enemyAI.registerEvaluator('support', new SupportBehavior());

            // Stocker les références
            combatManagerRef.current = combatManager;
            actionSystemRef.current = actionSystem;
            companionAIRef.current = companionAI;
            enemyAIRef.current = enemyAI;

            // Créer l'entité joueur avec stats d'équipement
            const equipmentStats = getEquippedStats();
            const playerEntity = createPlayerEntityFromStats(
                playerLevel, 
                playerCurrentHP, 
                playerMaxHP, 
                equipmentStats,
                equippedItems
            );
            
            const companions = loadActiveCompanions();
            const enemies = loadEnemiesFromData(scene.combat.enemy);

            // Initialiser le combat
            const success = combatManager.initializeCombat(
                scene,
                playerEntity,
                companions,
                enemies
            );

            if (success) {
                // Mettre à jour l'état React
                setCombatState({ ...combatManager.getCombatState() });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur initialisation combat:', error);
            return false;
        }
    }, []);

    // Exécuter une action du joueur
    const executePlayerAction = useCallback(async (action: Action): Promise<boolean> => {
        if (!actionSystemRef.current || !combatManagerRef.current) {
            throw new Error('Système de combat non initialisé');
        }

        try {
            const result: CombatActionResult = actionSystemRef.current.executeAction(action);
            
            if (result.success) {
                // Mettre à jour l'état React
                setCombatState({ ...combatManagerRef.current.getCombatState() });
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Erreur exécution action:', error);
            throw error;
        }
    }, []);

    // Avancer au tour suivant
    const advanceTurn = useCallback(() => {
        if (!combatManagerRef.current) return;

        console.log('🔄 Avancement du tour...');
        combatManagerRef.current.nextTurn();
        const newState = combatManagerRef.current.getCombatState();
        const currentEntity = combatManagerRef.current.getCurrentEntity();
        console.log(`➡️ Nouveau tour:`, currentEntity ? `${currentEntity.entity.name} (${currentEntity.instanceId})` : 'Aucune entité');
        setCombatState({ ...newState });
    }, []);

    // Vérifier si c'est le tour du joueur
    const isPlayerTurn = useCallback((): boolean => {
        if (!combatState) return false;

        const currentEntity = combatManagerRef.current?.getCurrentEntity();
        if (!currentEntity) return false;

        return combatState.playerEntities.includes(currentEntity.instanceId);
    }, [combatState]);

    // Obtenir l'entité courante
    const getCurrentEntity = useCallback((): CombatEntityInstance | null => {
        return combatManagerRef.current?.getCurrentEntity() || null;
    }, []);

    // Obtenir les actions valides pour une entité
    const getValidActions = useCallback((entityId: string): ActionType[] => {
        if (!actionSystemRef.current) return [];

        return actionSystemRef.current.getAvailableActions(entityId);
    }, []);

    // Obtenir les cibles valides pour une action
    const getValidTargets = useCallback((entityId: string, actionType: ActionType): string[] => {
        if (!combatState) return [];

        const entity = combatState.entities.get(entityId);
        if (!entity) return [];

        // TODO: Implémenter la logique de cibles valides selon l'action
        switch (actionType) {
            case 'attack':
                return combatState.enemyEntities.filter(id => {
                    const enemy = combatState.entities.get(id);
                    return enemy && enemy.isAlive;
                });
            
            case 'cast':
                // Dépend du sort sélectionné
                return [];
            
            default:
                return [];
        }
    }, [combatState]);

    // Obtenir les positions valides pour un mouvement
    const getValidMovePositions = useCallback((entityId: string): Array<{ x: number; y: number }> => {
        if (!combatState) return [];

        const entity = combatState.entities.get(entityId);
        if (!entity) return [];

        const currentPos = combatState.grid.getEntityPosition(entityId);
        if (!currentPos) return [];

        return combatState.grid.getAccessiblePositions(currentPos, entity.entity.movement);
    }, [combatState]);

    // Obtenir les positions valides pour une attaque
    const getValidAttackPositions = useCallback((entityId: string, weaponId?: string): Array<{ x: number; y: number }> => {
        if (!combatState) return [];

        const entity = combatState.entities.get(entityId);
        if (!entity) return [];

        const currentPos = combatState.grid.getEntityPosition(entityId);
        if (!currentPos) return [];

        // TODO: Utiliser les vraies données d'armes pour calculer la portée
        const range = weaponId?.includes('bow') || weaponId?.includes('crossbow') ? 6 : 1;

        const validPositions: Array<{ x: number; y: number }> = [];
        
        for (let x = currentPos.x - range; x <= currentPos.x + range; x++) {
            for (let y = currentPos.y - range; y <= currentPos.y + range; y++) {
                const distance = combatState.grid.getDistance(currentPos, { x, y });
                if (distance <= range && combatState.grid.isValidPosition({ x, y })) {
                    validPositions.push({ x, y });
                }
            }
        }

        return validPositions;
    }, [combatState]);

    // Exécuter automatiquement le tour de l'IA
    const executeAITurn = useCallback(async (): Promise<boolean> => {
        if (!combatManagerRef.current || !combatState) return false;
        
        const currentEntity = combatManagerRef.current.getCurrentEntity();
        if (!currentEntity) return false;
        
        // Vérifier si c'est une entité IA
        const isPlayer = combatState.playerEntities.includes(currentEntity.instanceId);
        if (isPlayer) return false; // Le joueur joue manuellement
        
        const isCompanion = combatState.companionEntities.includes(currentEntity.instanceId);
        const isEnemy = combatState.enemyEntities.includes(currentEntity.instanceId);
        
        if (!isCompanion && !isEnemy) return false;
        
        console.log(`🤖 Tour IA: ${currentEntity.entity.name} (${currentEntity.instanceId})`);
        console.log(`📊 État entité:`, {
            isAlive: currentEntity.isAlive,
            hasActed: currentEntity.hasActed,
            hasMoved: currentEntity.hasMoved,
            currentHp: currentEntity.currentHp,
            position: currentEntity.position
        });
        
        try {
            let decision: AIDecision | null = null;
            
            if (isCompanion && companionAIRef.current) {
                decision = companionAIRef.current.makeDecision(currentEntity, combatState);
                console.log(`🛡️ Décision compagnon:`, decision);
            } else if (isEnemy && enemyAIRef.current) {
                decision = enemyAIRef.current.decide(currentEntity, combatState);
                console.log(`⚔️ Décision ennemi:`, decision);
            }
            
            if (decision && decision.action !== 'end_turn') {
                // Convertir la décision en action
                const action = convertDecisionToAction(decision, currentEntity.instanceId);
                const result = await executePlayerAction(action);
                
                // Petit délai pour visualiser
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Si l'action a réussi et l'entité peut encore agir
                if (result && !currentEntity.hasActed && !currentEntity.hasMoved) {
                    // L'IA peut faire une deuxième action (mouvement si pas bougé)
                    const secondDecision = isCompanion && companionAIRef.current
                        ? companionAIRef.current.makeDecision(currentEntity, combatState)
                        : enemyAIRef.current?.decide(currentEntity, combatState);
                        
                    if (secondDecision && secondDecision.action === 'move' && secondDecision.action !== decision.action) {
                        const moveAction = convertDecisionToAction(secondDecision, currentEntity.instanceId);
                        await executePlayerAction(moveAction);
                    }
                }
            }
            
            // Terminer le tour
            await new Promise(resolve => setTimeout(resolve, 500));
            advanceTurn();
            return true;
            
        } catch (error) {
            console.error('Erreur IA:', error);
            advanceTurn();
            return false;
        }
    }, [combatState, executePlayerAction, advanceTurn]);

    // Helper pour convertir AIDecision en Action
    function convertDecisionToAction(decision: AIDecision, actorId: string): Action {
        switch (decision.action) {
            case 'move':
                return {
                    type: 'move',
                    actorId,
                    targetPosition: decision.position!
                };
                
            case 'attack':
                return {
                    type: 'attack',
                    actorId,
                    targetId: decision.target!,
                    weaponId: decision.weaponId || 'unarmed'
                };
                
            case 'cast':
                return {
                    type: 'cast',
                    actorId,
                    targetId: decision.target,
                    spellId: decision.spellId!,
                    targetPosition: decision.position
                };
                
            case 'defend':
                return {
                    type: 'defend',
                    actorId
                };
                
            default:
                return {
                    type: 'end_turn',
                    actorId
                };
        }
    }

    // Fonctions utilitaires pour créer des entités de test
    // Créer l'entité joueur avec les stats d'équipement
    function createPlayerEntityFromStats(
        level: number, 
        currentHP: number, 
        maxHP: number, 
        equipmentStats: Record<string, number>, 
        equippedItems: Record<string, any>
    ): CombatEntityInstance {
        // Calculer les bonus d'équipement
        const baseAttackBonus = Math.floor((level - 1) / 2) + 2; // Bonus de classe/niveau
        const baseDamageBonus = 2;
        const baseAC = 10 + Math.floor((level - 1) / 4); // AC de base évolutive
        
        // Appliquer les bonus d'équipement
        const finalAttackBonus = baseAttackBonus + (equipmentStats.attack || 0);
        const finalDamageBonus = baseDamageBonus + (equipmentStats.attack || 0);
        const finalAC = baseAC + (equipmentStats.defense || 0);
        const finalMaxHP = maxHP + (equipmentStats.health || 0);
        const finalCurrentHP = Math.min(currentHP + (equipmentStats.health || 0), finalMaxHP);
        
        // Déterminer les armes équipées
        const equippedWeapons: string[] = [];
        if (equippedItems.mainHand) {
            equippedWeapons.push(equippedItems.mainHand.id);
        }
        if (equippedItems.offHand && equippedItems.offHand.type === 'weapon') {
            equippedWeapons.push(equippedItems.offHand.id);
        }
        
        // Si pas d'arme, utiliser les poings
        if (equippedWeapons.length === 0) {
            equippedWeapons.push('unarmed');
        }
        
        return {
            instanceId: 'player',
            entity: {
                id: 'player',
                name: 'Joueur',
                maxHp: finalMaxHP,
                ac: finalAC,
                movement: 6, // Mouvement de base
                stats: {
                    strength: 14,
                    dexterity: 13,
                    constitution: 15,
                    intelligence: 12,
                    wisdom: 10,
                    charisma: 11
                },
                weaponIds: equippedWeapons,
                attackBonus: finalAttackBonus,
                damageBonus: finalDamageBonus,
                aiRole: 'tank', // Le joueur utilise l'IA tank par défaut
                aiPriorities: [], // Le joueur n'a pas d'IA
                level: level,
                image: 'player.png'
            },
            currentHp: finalCurrentHP,
            position: { x: 1, y: 3 },
            isAlive: true,
            initiative: 0,
            hasActed: false,
            hasMoved: false
        };
    }
    

    function loadActiveCompanions(): CombatEntityInstance[] {
        const companionStore = useCompanionStore.getState();
        const companions = companionStore.getActiveCompanionsForCombat();
        
        // Si pas de compagnons actifs, retourner tableau vide
        if (companions.length === 0) {
            return [];
        }
        
        return companions;
    }


    function loadEnemiesFromData(enemyConfig: Array<{id: string, count: number}>): CombatEntityInstance[] {
        const enemies: CombatEntityInstance[] = [];
        
        enemyConfig.forEach((config, groupIndex) => {
            const enemyData = DataManager.getEnemy(config.id);
            
            if (!enemyData) {
                // Créer un ennemi par défaut
                const defaultEnemy: CombatEntity = {
                    id: config.id,
                    name: config.id,
                    maxHp: 30,
                    ac: 12,
                    movement: 4,
                    stats: {
                        strength: 10,
                        dexterity: 10,
                        constitution: 10,
                        intelligence: 10,
                        wisdom: 10,
                        charisma: 10
                    },
                    weaponIds: ['unarmed'],
                    attackBonus: 2,
                    damageBonus: 0,
                    aiRole: 'skirmisher',
                    aiPriorities: ['melee_attack']
                };
                
                for (let i = 0; i < config.count; i++) {
                    enemies.push({
                        instanceId: `${config.id}-${i}`,
                        entity: defaultEnemy,
                        currentHp: defaultEnemy.maxHp,
                        position: { x: 6 + groupIndex, y: 2 + i },
                        isAlive: true,
                        initiative: 0,
                        hasActed: false,
                        hasMoved: false
                    });
                }
                return;
            }
            
            // Créer les instances d'ennemis
            for (let i = 0; i < config.count; i++) {
                const instanceId = `${config.id}-${i}`;
                const position = { 
                    x: Math.min(7, 5 + groupIndex), // Max x = 7
                    y: Math.min(5, 2 + i) // Max y = 5
                };
                
                enemies.push({
                    instanceId,
                    entity: { ...enemyData }, // Copie pour éviter les mutations
                    currentHp: enemyData.maxHp,
                    position,
                    isAlive: true,
                    initiative: 0,
                    hasActed: false,
                    hasMoved: false
                });
            }
        });

        return enemies;
    }

    // Retourner l'interface publique du hook
    return {
        // État
        combatState,
        
        // Références aux gestionnaires
        combatManager: combatManagerRef.current,
        actionSystem: actionSystemRef.current,
        companionAI: companionAIRef.current,
        enemyAI: enemyAIRef.current,

        // Actions principales
        initializeCombat,
        executePlayerAction,
        executeAITurn,
        advanceTurn,

        // Getters
        isPlayerTurn,
        getCurrentEntity,
        getValidActions,
        getValidTargets,
        getValidMovePositions,
        getValidAttackPositions
    };
}