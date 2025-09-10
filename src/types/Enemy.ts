// Interface simplifiée pour un ennemi
export interface Enemy {
    id: string;
    name: string;
    
    // Stats de combat essentielles
    maxHp: number;
    ac: number;  // Armor Class
    movement: number;  // Cases par tour
    xp: number;
    challengeRating?: string;  // "1/4", "1/2", "1", etc.
    
    // Stats D&D (pour les jets)
    stats: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    
    // Attaques
    attacks: EnemyAttack[];
    
    // IA simplifiée
    role: AIRole;
    aiPriority: AIAction[];
    
    // Visuel
    image?: string;
}

// Rôles d'IA simplifiés
export type AIRole = 'skirmisher' | 'archer' | 'tank' | 'caster' | 'support' | 'berserker';

// Actions d'IA possibles
export type AIAction = 'melee_attack' | 'ranged_attack' | 'move_to_cover' | 'flee' | 'defend';

// Type de dégâts simplifié (français)
export type DamageType = 'tranchant' | 'perforant' | 'contondant' | 'magique';

// Attaque simplifiée
export interface EnemyAttack {
    name: string;
    type: 'melee' | 'ranged';
    attackBonus: number;  // Bonus pour toucher
    range: number;  // En cases
    targets: number;  // Nombre de cibles
    damageDice: string;  // "1d6"
    damageBonus: number;  // +2
    damageType: DamageType;
}

// Instance d'ennemi en combat (avec état)
export interface EnemyInstance {
    enemy: Enemy;
    instanceId: string;  // ID unique pour cette instance
    currentHp: number;
    position: {
        x: number;
        y: number;
    };
    isAlive: boolean;
}