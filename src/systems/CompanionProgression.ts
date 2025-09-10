import type { Companion, CompanionProgressionPath } from '../types/Companion';
import type { CompanionConfig } from './CompanionManager';

// Tables de progression par path
export interface ProgressionTable {
    hpGain: number[];      // HP par niveau
    statGains: {
        strength: number[];
        dexterity: number[];
        constitution: number[];
        intelligence: number[];
        wisdom: number[];
        charisma: number[];
    };
    attackBonusGain: number[];
    damageBonusGain: number[];
    spellModifierGain: number[];
    newSpells: Record<number, string[]>;  // Niveau -> sorts débloqués
    newWeapons: Record<number, string[]>; // Niveau -> armes débloquées
}

// Tables de progression pour chaque path
const PROGRESSION_TABLES: Record<CompanionProgressionPath, ProgressionTable> = {
    warrior: {
        hpGain: [0, 10, 8, 8, 6, 8, 6, 8, 6, 8, 6, 8, 6, 8, 6, 8, 6, 8, 6, 8, 6], // Index 0 = level 1, pas de gain
        statGains: {
            strength: [0, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            dexterity: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            constitution: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            intelligence: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            wisdom: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            charisma: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        attackBonusGain: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        damageBonusGain: [0, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
        spellModifierGain: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        newSpells: {
            // Warriors ont pas de sorts (sauf quelques capacités spéciales)
        },
        newWeapons: {
            2: ['sword_basic'],
            4: ['sword_masterwork'],
            6: ['axe_basic'],
            8: ['hammer_war'],
            10: ['sword_magic'],
            15: ['sword_legendary']
        }
    },

    mage: {
        hpGain: [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        statGains: {
            strength: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            dexterity: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            constitution: [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            intelligence: [0, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            wisdom: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            charisma: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        attackBonusGain: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        damageBonusGain: [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        spellModifierGain: [0, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
        newSpells: {
            1: ['magic_missile'],
            2: ['shield_spell'],
            3: ['fireball'],
            4: ['ice_shard'],
            5: ['lightning_bolt'],
            7: ['heal_wounds'],
            9: ['fireball_greater'],
            11: ['ice_storm'],
            13: ['lightning_storm'],
            15: ['meteor'],
            17: ['time_stop'],
            19: ['wish']
        },
        newWeapons: {
            1: ['staff_basic'],
            5: ['staff_magic'],
            10: ['staff_power'],
            15: ['staff_archmage']
        }
    },

    support: {
        hpGain: [0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        statGains: {
            strength: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            dexterity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            constitution: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            intelligence: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            wisdom: [0, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            charisma: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        },
        attackBonusGain: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        damageBonusGain: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        spellModifierGain: [0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        newSpells: {
            1: ['heal_light'],
            2: ['bless'],
            3: ['cure_poison'],
            4: ['heal_moderate'],
            5: ['protection_evil'],
            6: ['dispel_magic'],
            7: ['heal_serious'],
            8: ['sanctuary'],
            9: ['remove_curse'],
            10: ['heal_critical'],
            12: ['resurrection'],
            14: ['heal_mass'],
            16: ['miracle'],
            18: ['divine_intervention'],
            20: ['true_resurrection']
        },
        newWeapons: {
            1: ['mace_basic'],
            3: ['shield_basic'],
            6: ['mace_blessed'],
            10: ['shield_magic'],
            15: ['mace_divine']
        }
    }
};

// Résultat d'une montée de niveau
export interface LevelUpResult {
    success: boolean;
    message: string;
    changes: {
        hpGain: number;
        statGains: Partial<Companion['stats']>;
        attackBonusGain: number;
        damageBonusGain: number;
        spellModifierGain: number;
        newSpells: string[];
        newWeapons: string[];
    };
    newLevel: number;
}

// Gestionnaire de la progression des compagnons
export class CompanionProgression {
    private config: CompanionConfig;

    constructor(config: CompanionConfig) {
        this.config = config;
    }

    // Calculer l'XP requis pour un niveau donné
    calculateXpForLevel(level: number): number {
        if (level <= 1) return 0;
        
        let totalXp = 0;
        for (let lvl = 2; lvl <= level; lvl++) {
            totalXp += Math.floor(this.config.baseXpPerLevel * Math.pow(this.config.xpGrowthRate, lvl - 2));
        }
        
        return totalXp;
    }

    // Calculer le niveau d'un compagnon selon son XP
    calculateLevelFromXp(xp: number): number {
        for (let level = 1; level <= this.config.maxLevel; level++) {
            const requiredXp = this.calculateXpForLevel(level + 1);
            if (xp < requiredXp) {
                return level;
            }
        }
        return this.config.maxLevel;
    }

    // Vérifier si un compagnon peut monter de niveau
    canLevelUp(companion: Companion): boolean {
        if (companion.level >= this.config.maxLevel) return false;
        
        const requiredXp = this.calculateXpForLevel(companion.level + 1);
        return companion.xp >= requiredXp;
    }

    // Faire monter un compagnon de niveau (auto level-up)
    levelUpCompanion(companion: Companion): LevelUpResult {
        if (!this.canLevelUp(companion)) {
            return {
                success: false,
                message: `${companion.name} ne peut pas monter de niveau`,
                changes: this.getEmptyChanges(),
                newLevel: companion.level
            };
        }

        const newLevel = companion.level + 1;
        const table = PROGRESSION_TABLES[companion.progressionPath];
        
        // Calculer tous les gains
        const changes = {
            hpGain: table.hpGain[newLevel] || 0,
            statGains: this.calculateStatGains(table, newLevel),
            attackBonusGain: table.attackBonusGain[newLevel] || 0,
            damageBonusGain: table.damageBonusGain[newLevel] || 0,
            spellModifierGain: table.spellModifierGain[newLevel] || 0,
            newSpells: table.newSpells[newLevel] || [],
            newWeapons: table.newWeapons[newLevel] || []
        };

        // Appliquer les changements au compagnon
        this.applyLevelUpChanges(companion, changes, newLevel);

        return {
            success: true,
            message: `${companion.name} monte au niveau ${newLevel} !`,
            changes,
            newLevel
        };
    }

    // Ajouter de l'XP et auto level-up si possible
    addExperience(companion: Companion, xpGain: number): LevelUpResult[] {
        companion.xp += xpGain;
        
        const levelUps: LevelUpResult[] = [];
        
        // Boucle pour gérer les montées de niveau multiples
        while (this.canLevelUp(companion)) {
            const result = this.levelUpCompanion(companion);
            if (result.success) {
                levelUps.push(result);
            } else {
                break; // Arrêter si erreur
            }
        }

        return levelUps;
    }

    // Obtenir un résumé de progression pour un compagnon
    getProgressionSummary(companion: Companion): {
        currentLevel: number;
        currentXp: number;
        xpToNextLevel: number;
        maxLevel: boolean;
        progressionPath: CompanionProgressionPath;
    } {
        const xpToNext = companion.level >= this.config.maxLevel ? 
            0 : this.calculateXpForLevel(companion.level + 1) - companion.xp;

        return {
            currentLevel: companion.level,
            currentXp: companion.xp,
            xpToNextLevel: Math.max(0, xpToNext),
            maxLevel: companion.level >= this.config.maxLevel,
            progressionPath: companion.progressionPath
        };
    }

    // Obtenir les récompenses du prochain niveau
    getNextLevelRewards(companion: Companion): LevelUpResult['changes'] | null {
        if (companion.level >= this.config.maxLevel) return null;

        const nextLevel = companion.level + 1;
        const table = PROGRESSION_TABLES[companion.progressionPath];

        return {
            hpGain: table.hpGain[nextLevel] || 0,
            statGains: this.calculateStatGains(table, nextLevel),
            attackBonusGain: table.attackBonusGain[nextLevel] || 0,
            damageBonusGain: table.damageBonusGain[nextLevel] || 0,
            spellModifierGain: table.spellModifierGain[nextLevel] || 0,
            newSpells: table.newSpells[nextLevel] || [],
            newWeapons: table.newWeapons[nextLevel] || []
        };
    }

    // Réinitialiser un compagnon à un niveau donné (pour tests/debug)
    resetCompanionToLevel(companion: Companion, targetLevel: number): boolean {
        if (targetLevel < 1 || targetLevel > this.config.maxLevel) return false;

        // Recalculer toutes les stats depuis le niveau 1
        const baseStats = this.getBaseStatsForPath(companion.progressionPath);
        
        // Reset aux stats de base
        Object.assign(companion.stats, baseStats.stats);
        companion.maxHp = baseStats.maxHp;
        companion.attackBonus = baseStats.attackBonus;
        companion.damageBonus = baseStats.damageBonus;
        companion.spellModifier = baseStats.spellModifier;
        companion.weaponIds = [...baseStats.weaponIds];
        companion.spellIds = [...(baseStats.spellIds || [])];
        
        // Appliquer la progression jusqu'au niveau cible
        const table = PROGRESSION_TABLES[companion.progressionPath];
        for (let level = 2; level <= targetLevel; level++) {
            const changes = {
                hpGain: table.hpGain[level] || 0,
                statGains: this.calculateStatGains(table, level),
                attackBonusGain: table.attackBonusGain[level] || 0,
                damageBonusGain: table.damageBonusGain[level] || 0,
                spellModifierGain: table.spellModifierGain[level] || 0,
                newSpells: table.newSpells[level] || [],
                newWeapons: table.newWeapons[level] || []
            };
            
            this.applyLevelUpChanges(companion, changes, level);
        }

        companion.level = targetLevel;
        companion.xp = this.calculateXpForLevel(targetLevel);

        return true;
    }

    // Méthodes privées
    private calculateStatGains(table: ProgressionTable, level: number): Partial<Companion['stats']> {
        const gains: Partial<Companion['stats']> = {};
        
        Object.keys(table.statGains).forEach(statName => {
            const stat = statName as keyof Companion['stats'];
            const gain = table.statGains[stat][level];
            if (gain > 0) {
                gains[stat] = gain;
            }
        });

        return gains;
    }

    private applyLevelUpChanges(companion: Companion, changes: LevelUpResult['changes'], newLevel: number): void {
        // Appliquer HP
        companion.maxHp += changes.hpGain;

        // Appliquer stats
        Object.keys(changes.statGains).forEach(statName => {
            const stat = statName as keyof Companion['stats'];
            const gain = changes.statGains[stat]!;
            companion.stats[stat] += gain;
        });

        // Appliquer bonus d'attaque et dégâts
        companion.attackBonus += changes.attackBonusGain;
        companion.damageBonus += changes.damageBonusGain;

        // Appliquer modificateur de sorts
        if (companion.spellModifier !== undefined) {
            companion.spellModifier += changes.spellModifierGain;
        } else if (changes.spellModifierGain > 0) {
            companion.spellModifier = changes.spellModifierGain;
        }

        // Ajouter nouveaux sorts
        if (!companion.spellIds) companion.spellIds = [];
        companion.spellIds.push(...changes.newSpells);

        // Ajouter nouvelles armes
        companion.weaponIds.push(...changes.newWeapons);

        // Mettre à jour le niveau
        companion.level = newLevel;
    }

    private getEmptyChanges(): LevelUpResult['changes'] {
        return {
            hpGain: 0,
            statGains: {},
            attackBonusGain: 0,
            damageBonusGain: 0,
            spellModifierGain: 0,
            newSpells: [],
            newWeapons: []
        };
    }

    private getBaseStatsForPath(path: CompanionProgressionPath): Companion {
        // Stats de base selon le path (niveau 1)
        const baseStats: Record<CompanionProgressionPath, Partial<Companion>> = {
            warrior: {
                stats: {
                    strength: 15,
                    dexterity: 12,
                    constitution: 14,
                    intelligence: 10,
                    wisdom: 11,
                    charisma: 10
                },
                maxHp: 12,
                attackBonus: 3,
                damageBonus: 2,
                spellModifier: undefined,
                weaponIds: ['sword_basic'],
                spellIds: []
            },
            mage: {
                stats: {
                    strength: 8,
                    dexterity: 13,
                    constitution: 12,
                    intelligence: 16,
                    wisdom: 14,
                    charisma: 11
                },
                maxHp: 6,
                attackBonus: 1,
                damageBonus: 0,
                spellModifier: 3,
                weaponIds: ['staff_basic'],
                spellIds: ['magic_missile']
            },
            support: {
                stats: {
                    strength: 10,
                    dexterity: 12,
                    constitution: 13,
                    intelligence: 12,
                    wisdom: 16,
                    charisma: 14
                },
                maxHp: 8,
                attackBonus: 2,
                damageBonus: 1,
                spellModifier: 3,
                weaponIds: ['mace_basic'],
                spellIds: ['heal_light']
            }
        };

        return baseStats[path] as Companion;
    }
}