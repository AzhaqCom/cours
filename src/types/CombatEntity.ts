import type { AIRole, AIAction } from './Enemy';

// Interface de base pour toute entité qui peut combattre
export interface CombatEntity {
    id: string;
    name: string;
    
    // Stats de base
    maxHp: number;
    ac: number;  // Armor Class
    movement: number;  // En CASES
    
    // Stats D&D pour les jets
    stats: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    
    // Option A: Références aux armes et sorts
    weaponIds: string[];
    attackBonus: number;  // Bonus au toucher
    damageBonus: number;  // Bonus aux dégâts
    spellIds?: string[];
    spellModifier?: number;  // Bonus aux sorts
    
    // IA
    aiRole: AIRole;
    aiPriorities: AIAction[];
    
    // Progression (optionnel pour les entités non-compagnons)
    level?: number;
    
    // Visuel
    image?: string;
}

// Instance d'entité en combat (avec état)
export interface CombatEntityInstance {
    entity: CombatEntity;
    instanceId: string;
    currentHp: number;
    position: {
        x: number;
        y: number;
    };
    isAlive: boolean;
    initiative: number;  // Résultat du jet d'initiative
    hasActed: boolean;  // A déjà agi ce tour
    hasMoved: boolean;  // A déjà bougé ce tour
}