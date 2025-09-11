import type { Position } from './Grid';
import type { CombatManager, CombatActionResult } from './CombatManager';
import type { CombatEntityInstance } from '../../types/CombatEntity';
import { DataManager } from '../DataManager';

// Types d'actions possibles
export type ActionType = 'move' | 'attack' | 'cast' | 'useItem' | 'defend' | 'end_turn';

// Interface de base pour une action
export interface CombatAction {
    type: ActionType;
    actorId: string; // ID de l'entité qui effectue l'action
}

// Action de mouvement
export interface MoveAction extends CombatAction {
    type: 'move';
    targetPosition: Position;
}

// Action d'attaque
export interface AttackAction extends CombatAction {
    type: 'attack';
    weaponId: string;
    targetId: string;
}

// Action de sort
export interface CastSpellAction extends CombatAction {
    type: 'cast';
    spellId: string;
    targetId?: string; // Optionnel pour les sorts self/area
    targetPosition?: Position; // Pour les sorts de zone
}

// Action d'utilisation d'objet
export interface UseItemAction extends CombatAction {
    type: 'useItem';
    itemId: string;
    targetId?: string;
}

// Action de défense
export interface DefendAction extends CombatAction {
    type: 'defend';
}

// Action de fin de tour
export interface EndTurnAction extends CombatAction {
    type: 'end_turn';
}

// Union de toutes les actions
export type Action = MoveAction | AttackAction | CastSpellAction | UseItemAction | DefendAction | EndTurnAction;

// Système de validation et d'exécution des actions
export class ActionSystem {
    private combatManager: CombatManager;

    constructor(combatManager: CombatManager) {
        this.combatManager = combatManager;
    }

    // Valider une action avant de l'exécuter
    validateAction(action: Action): { valid: boolean; reason?: string } {
        const combatState = this.combatManager.getCombatState();
        const actor = combatState.entities.get(action.actorId);

        if (!actor) {
            return { valid: false, reason: 'Acteur non trouvé' };
        }

        if (!actor.isAlive) {
            return { valid: false, reason: 'L\'acteur est mort' };
        }

        // Vérifier si c'est le tour de l'acteur
        const currentEntity = this.combatManager.getCurrentEntity();
        if (!currentEntity || currentEntity.instanceId !== action.actorId) {
            return { valid: false, reason: 'Ce n\'est pas le tour de cette entité' };
        }

        // Validation spécifique selon le type d'action
        switch (action.type) {
            case 'move':
                return this.validateMoveAction(action, actor, combatState);
            case 'attack':
                return this.validateAttackAction(action, actor, combatState);
            case 'cast':
                return this.validateCastAction(action, actor, combatState);
            case 'useItem':
                return this.validateUseItemAction(action, actor, combatState);
            case 'defend':
            case 'end_turn':
                return { valid: true };
            default:
                return { valid: false, reason: 'Type d\'action inconnu' };
        }
    }

    // Exécuter une action validée
    executeAction(action: Action): CombatActionResult {
        const validation = this.validateAction(action);
        if (!validation.valid) {
            return { success: false, message: validation.reason };
        }

        switch (action.type) {
            case 'move':
                return this.executeMoveAction(action);
            case 'attack':
                return this.executeAttackAction(action);
            case 'cast':
                return this.executeCastAction(action);
            case 'useItem':
                return this.executeUseItemAction(action);
            case 'defend':
                return this.executeDefendAction(action);
            case 'end_turn':
                return this.executeEndTurnAction(action);
            default:
                return { success: false, message: 'Action non implémentée' };
        }
    }

    // Validation du mouvement
    private validateMoveAction(action: MoveAction, actor: CombatEntityInstance, combatState: any): { valid: boolean; reason?: string } {
        if (actor.hasMoved) {
            return { valid: false, reason: 'Cette entité a déjà bougé ce tour' };
        }

        const currentPos = combatState.grid.getEntityPosition(action.actorId);
        if (!currentPos) {
            return { valid: false, reason: 'Position actuelle non trouvée' };
        }

        if (!combatState.grid.isValidMove(currentPos, action.targetPosition, actor.entity.movement)) {
            return { valid: false, reason: 'Mouvement invalide ou trop loin' };
        }

        return { valid: true };
    }

    // Validation de l'attaque
    private validateAttackAction(action: AttackAction, actor: CombatEntityInstance, _combatState: any): { valid: boolean; reason?: string } {
        if (actor.hasActed) {
            return { valid: false, reason: 'Cette entité a déjà agi ce tour' };
        }

        const target = _combatState.entities.get(action.targetId);
        if (!target) {
            return { valid: false, reason: 'Cible non trouvée' };
        }

        if (!target.isAlive) {
            return { valid: false, reason: 'La cible est déjà morte' };
        }

        // Vérifier que l'acteur possède l'arme
        if (!actor.entity.weaponIds.includes(action.weaponId)) {
            return { valid: false, reason: 'L\'acteur ne possède pas cette arme' };
        }

        // Vérifier la portée de l'arme
        const actorPos = _combatState.grid.getEntityPosition(action.actorId);
        const targetPos = _combatState.grid.getEntityPosition(action.targetId);
        if (!actorPos || !targetPos) {
            return { valid: false, reason: 'Position non trouvée' };
        }

        // Vérifier la portée avec DataManager
        const distance = _combatState.grid.getDistance(actorPos, targetPos);
        const weaponRange = DataManager.getWeaponRange(action.weaponId);
        if (distance > weaponRange) {
            return { valid: false, reason: `Cible hors de portée (${distance} > ${weaponRange})` };
        }

        return { valid: true };
    }

    // Validation du sort
    private validateCastAction(_action: CastSpellAction, actor: CombatEntityInstance, _combatState: any): { valid: boolean; reason?: string } {
        if (actor.hasActed) {
            return { valid: false, reason: 'Cette entité a déjà agi ce tour' };
        }

        // Vérifier que l'acteur connaît le sort
        if (!actor.entity.spellIds?.includes(_action.spellId)) {
            return { valid: false, reason: 'L\'acteur ne connaît pas ce sort' };
        }

        // Vérifier la portée du sort
        if (_action.targetId) {
            const casterPos = _combatState.grid.getEntityPosition(_action.actorId);
            const targetPos = _combatState.grid.getEntityPosition(_action.targetId);
            
            if (!DataManager.canTargetWithSpell(_action.spellId, casterPos, targetPos)) {
                return { valid: false, reason: 'Cible invalide pour ce sort' };
            }
        }

        // TODO: Vérifier les slots de sorts disponibles

        return { valid: true };
    }

    // Validation de l'utilisation d'objet
    private validateUseItemAction(_action: UseItemAction, actor: CombatEntityInstance, _combatState: any): { valid: boolean; reason?: string } {
        if (actor.hasActed) {
            return { valid: false, reason: 'Cette entité a déjà agi ce tour' };
        }

        // TODO: Vérifier que l'acteur possède l'objet
        // TODO: Vérifier si l'objet est utilisable en combat

        return { valid: true };
    }

    // Exécution du mouvement
    private executeMoveAction(action: MoveAction): CombatActionResult {
        return this.combatManager.moveEntity(action.actorId, action.targetPosition);
    }

    // Exécution de l'attaque
    private executeAttackAction(action: AttackAction): CombatActionResult {
        const combatState = this.combatManager.getCombatState();
        const actor = combatState.entities.get(action.actorId)!;

        // Calculer les dégâts avec DataManager
        const damage = DataManager.calculateWeaponDamage(
            action.weaponId, 
            actor.entity.damageBonus
        );
        const result = this.combatManager.applyDamage(action.targetId, damage);
        
        if (result.success) {
            actor.hasActed = true;
        }

        return result;
    }

    // Exécution du sort
    private executeCastAction(action: CastSpellAction): CombatActionResult {
        const combatState = this.combatManager.getCombatState();
        const actor = combatState.entities.get(action.actorId)!;

        // Calculer les effets du sort avec DataManager
        const spellEffect = DataManager.calculateSpellEffect(
            action.spellId,
            actor.entity.spellModifier || 0
        );

        if (spellEffect.damage && action.targetId) {
            const result = this.combatManager.applyDamage(action.targetId, spellEffect.damage);
            if (result.success) {
                actor.hasActed = true;
            }
            return result;
        } else if (spellEffect.healing && action.targetId) {
            const result = this.combatManager.applyHealing(action.targetId, spellEffect.healing);
            if (result.success) {
                actor.hasActed = true;
            }
            return result;
        }

        // Sort sans effet direct (buffs, etc.)
        actor.hasActed = true;
        return { success: true, message: `${action.spellId} lancé` };
    }

    // Exécution de l'utilisation d'objet
    private executeUseItemAction(_action: UseItemAction): CombatActionResult {
        const combatState = this.combatManager.getCombatState();
        const actor = combatState.entities.get(_action.actorId)!;

        // TODO: Implémenter l'utilisation d'objets
        actor.hasActed = true;
        
        return { success: true, message: 'Objet utilisé (simulation)' };
    }

    // Exécution de la défense
    private executeDefendAction(_action: DefendAction): CombatActionResult {
        const combatState = this.combatManager.getCombatState();
        const actor = combatState.entities.get(_action.actorId)!;

        // TODO: Appliquer un bonus de défense pour le tour
        actor.hasActed = true;
        
        return { success: true, message: `${actor.entity.name} se défend` };
    }

    // Exécution de la fin de tour
    private executeEndTurnAction(_action: EndTurnAction): CombatActionResult {
        this.combatManager.nextTurn();
        return { success: true, message: 'Tour terminé' };
    }

    // Obtenir les actions possibles pour une entité
    getAvailableActions(entityId: string): ActionType[] {
        const combatState = this.combatManager.getCombatState();
        const entity = combatState.entities.get(entityId);

        if (!entity || !entity.isAlive) {
            return [];
        }

        const actions: ActionType[] = ['end_turn'];

        if (!entity.hasMoved) {
            actions.push('move');
        }

        if (!entity.hasActed) {
            actions.push('attack', 'defend');
            
            if (entity.entity.spellIds && entity.entity.spellIds.length > 0) {
                actions.push('cast');
            }
            
            // TODO: Ajouter 'useItem' si l'entité a des objets utilisables
        }

        return actions;
    }
}