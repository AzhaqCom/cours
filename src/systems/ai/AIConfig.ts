// Configuration centralisée pour le système d'IA
export interface AIConfig {
    // Poids pour l'évaluation des menaces
    threat: {
        healthFactor: number;
        attackBonusMultiplier: number;
        damageBonusMultiplier: number;
        spellCountMultiplier: number;
        spellModifierMultiplier: number;
        immediateRangeBonus: number;  // Distance <= 1
        closeRangeBonus: number;      // Distance <= 3
        distanceReductionRate: number; // Malus par case de distance
        roleModifiers: {
            archer: { close: number; distant: number };
            caster: number;
            tank: { close: number; distant: number };
            skirmisher: number;
            support: number;
            default: number;
        };
    };

    // Configuration pour l'évaluation des positions
    position: {
        baseSafetyScore: number;
        enemyProximityPenalty: number;  // Malus par ennemi proche
        edgeProtectionBonus: number;    // Bonus mur/bord
        cornerProtectionBonus: number;  // Bonus coin
        mobilityPerExit: number;        // Score par sortie disponible
        lowMobilityPenalty: number;     // Malus si <= 3 sorties
        
        // Bonus offensifs par rôle et distance
        offensiveBonus: {
            archer: { minRange: number; maxRange: number; bonus: number };
            caster: { minRange: number; maxRange: number; bonus: number };
            melee: { maxRange: number; bonus: number };
            default: { maxRange: number; bonus: number };
        };
        
        // Support aux alliés
        allySupport: {
            healingUrgentBonus: number;   // Allié < 30% HP
            healingMediumBonus: number;   // Allié < 60% HP
            cohesionBonus: number;        // Bonus par allié proche
            tankProtectionBonus: number;  // Tank près allié fragile
        };
        
        lowHealthThreshold: number;    // Seuil HP faible
        criticalHealthThreshold: number; // Seuil HP critique
    };

    // Modificateurs de priorité globaux
    priority: {
        survivalThreshold: number;     // Seuil HP critique (25%)
        defenseBonus: number;         // Bonus défense si blessé
        fleeBonus: number;            // Bonus fuite si blessé
        healingUrgentBonus: number;   // Bonus soins urgents

        // Modificateurs numériques
        outnumberedDefenseBonus: number;
        outnumberedMoveBonus: number;
        advantageAttackBonus: number;
        advantageCastBonus: number;
    };

    // Distances et portées
    ranges: {
        threatEvaluation: number;     // Distance max éval menaces
        positionEvaluation: number;   // Distance éval positions
        allySupport: number;          // Distance support alliés
        immediateRange: number;       // Corps-à-corps
        closeRange: number;           // Proche
        longRange: number;            // Distance
    };

    // Seuils de santé
    health: {
        critical: number;    // 25%
        low: number;         // 50%
        medium: number;      // 75%
    };
}

// Configuration par défaut - équilibrée pour gameplay tactique
export const DEFAULT_AI_CONFIG: AIConfig = {
    threat: {
        healthFactor: 30,
        attackBonusMultiplier: 2,
        damageBonusMultiplier: 3,
        spellCountMultiplier: 5,
        spellModifierMultiplier: 2,
        immediateRangeBonus: 20,
        closeRangeBonus: 10,
        distanceReductionRate: 1,    // Malus linéaire par distance
        roleModifiers: {
            archer: { close: 5, distant: 15 },
            caster: 12,
            tank: { close: 15, distant: 5 },
            skirmisher: 8,
            support: 15,  // Haute priorité
            default: 5
        }
    },

    position: {
        baseSafetyScore: 50,
        enemyProximityPenalty: 10,
        edgeProtectionBonus: 5,
        cornerProtectionBonus: 10,
        mobilityPerExit: 2,
        lowMobilityPenalty: 5,
        
        offensiveBonus: {
            archer: { minRange: 3, maxRange: 6, bonus: 15 },
            caster: { minRange: 2, maxRange: 5, bonus: 12 },
            melee: { maxRange: 2, bonus: 10 },
            default: { maxRange: 3, bonus: 8 }
        },
        
        allySupport: {
            healingUrgentBonus: 15,
            healingMediumBonus: 8,
            cohesionBonus: 3,
            tankProtectionBonus: 8
        },
        
        lowHealthThreshold: 0.6,
        criticalHealthThreshold: 0.3
    },

    priority: {
        survivalThreshold: 0.25,
        defenseBonus: 30,
        fleeBonus: 20,
        healingUrgentBonus: 40,
        
        outnumberedDefenseBonus: 15,
        outnumberedMoveBonus: 10,
        advantageAttackBonus: 15,
        advantageCastBonus: 10
    },

    ranges: {
        threatEvaluation: 6,
        positionEvaluation: 2,
        allySupport: 3,
        immediateRange: 1,
        closeRange: 3,
        longRange: 6
    },

    health: {
        critical: 0.25,
        low: 0.5,
        medium: 0.75
    }
};

// Configurations alternatives pour différents niveaux de difficulté
export const AGGRESSIVE_AI_CONFIG: AIConfig = {
    ...DEFAULT_AI_CONFIG,
    priority: {
        ...DEFAULT_AI_CONFIG.priority,
        advantageAttackBonus: 25,
        outnumberedDefenseBonus: 5  // IA plus agressive même en infériorité
    }
};

export const DEFENSIVE_AI_CONFIG: AIConfig = {
    ...DEFAULT_AI_CONFIG,
    priority: {
        ...DEFAULT_AI_CONFIG.priority,
        defenseBonus: 40,
        fleeBonus: 30,
        outnumberedDefenseBonus: 25
    }
};