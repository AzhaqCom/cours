import { useState, useCallback, useRef } from 'react';
import type { CombatScene } from '../types/Scene';
import type { CombatState, CombatActionResult } from '../systems/combat/CombatManager';
import type { CombatEntityInstance } from '../types/CombatEntity';
import type { Action, ActionType } from '../systems/combat/Actions';
import { CombatManager } from '../systems/combat/CombatManager';
import { ActionSystem } from '../systems/combat/Actions';
import { CompanionAIManager } from '../systems/CompanionAI';
import { AIController } from '../systems/ai/AICore';
import { useInventoryStore } from '../store/inventoryStore';
import { useGameStore } from '../store/gameStore';
import { SkirmisherBehavior, ArcherBehavior, TankBehavior, CasterBehavior, SupportBehavior } from '../systems/ai/Behaviors';

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
            
            const companions = createTestCompanions();
            const enemies = createTestEnemies(scene.combat.enemy);

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

        combatManagerRef.current.nextTurn();
        setCombatState({ ...combatManagerRef.current.getCombatState() });
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

    // Fonctions utilitaires pour créer des entités de test
    // Créer l'entité joueur avec les stats d'équipement
    function createPlayerEntityFromStats(
        level: number, 
        currentHP: number, 
        maxHP: number, 
        equipmentStats: any, 
        equippedItems: any
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
    
    // Cette fonction n'est plus utilisée car on utilise createPlayerEntityFromStats
    /* function _createTestPlayerEntity(): CombatEntityInstance {
        return {
            instanceId: 'player-1',
            entity: {
                id: 'player',
                name: 'Héros',
                maxHp: 100,
                ac: 15,
                movement: 6,
                stats: {
                    strength: 16,
                    dexterity: 14,
                    constitution: 15,
                    intelligence: 12,
                    wisdom: 13,
                    charisma: 11
                },
                weaponIds: ['sword_basic'],
                attackBonus: 5,
                damageBonus: 3,
                spellIds: ['heal_light'],
                spellModifier: 2,
                aiRole: 'skirmisher',
                aiPriorities: ['melee_attack', 'move_to_cover'],
                level: 5,
                image: 'player-hero.png'
            },
            currentHp: 100,
            position: { x: 0, y: 0 },
            isAlive: true,
            initiative: 0,
            hasActed: false,
            hasMoved: false
        };
    } */

    function createTestCompanions(): CombatEntityInstance[] {
        return [
            {
                instanceId: 'companion-1',
                entity: {
                    id: 'companion-warrior',
                    name: 'Garde Loyal',
                    maxHp: 80,
                    ac: 17,
                    movement: 5,
                    stats: {
                        strength: 18,
                        dexterity: 12,
                        constitution: 16,
                        intelligence: 10,
                        wisdom: 11,
                        charisma: 9
                    },
                    weaponIds: ['sword_basic', 'shield_basic'],
                    attackBonus: 6,
                    damageBonus: 4,
                    aiRole: 'tank',
                    aiPriorities: ['defend', 'melee_attack'],
                    level: 4,
                    image: 'companion-warrior.png'
                },
                currentHp: 80,
                position: { x: 1, y: 0 },
                isAlive: true,
                initiative: 0,
                hasActed: false,
                hasMoved: false
            }
        ];
    }

    function createTestEnemies(enemyData: Array<{ id: string; count: number }>): CombatEntityInstance[] {
        const enemies: CombatEntityInstance[] = [];
        
        enemyData.forEach((enemyGroup, groupIndex) => {
            for (let i = 0; i < enemyGroup.count; i++) {
                enemies.push({
                    instanceId: `enemy-${enemyGroup.id}-${i}`,
                    entity: {
                        id: enemyGroup.id,
                        name: `${enemyGroup.id} ${i + 1}`,
                        maxHp: 40,
                        ac: 13,
                        movement: 4,
                        stats: {
                            strength: 14,
                            dexterity: 12,
                            constitution: 13,
                            intelligence: 8,
                            wisdom: 10,
                            charisma: 8
                        },
                        weaponIds: ['sword_basic'],
                        attackBonus: 3,
                        damageBonus: 2,
                        aiRole: 'skirmisher',
                        aiPriorities: ['melee_attack', 'move_to_cover'],
                        level: 2,
                        image: `enemy-${enemyGroup.id}.png`
                    },
                    currentHp: 40,
                    position: { x: 6 + groupIndex, y: 3 + i },
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