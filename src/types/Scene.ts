// Type enum pour les différents types de scènes
export type SceneType = 'TEXTUAL' | 'DIALOGUE' | 'COMBAT' | 'MERCHANT';

// Interface de base commune à toutes les scènes
export interface BaseScene {
    id: string;
    title: string;
    type: SceneType;
    choices: Choice[];  // Un tableau car plusieurs choix possibles
    requirements?: Requirement;  // Optionnel, pas toutes les scènes ont des prérequis
}

// Scène textuelle classique (narration)
export interface TextualScene extends BaseScene {
    type: 'TEXTUAL';
    description: string;
}

// Scène de dialogue avec un PNJ
export interface DialogueScene extends BaseScene {
    type: 'DIALOGUE';
    npc: {
        name: string;
        portrait: string;  // URL ou nom du fichier image
        dialogue: string;  // Ce que le PNJ dit
    };
    description?: string;  // Description contextuelle optionnelle
}

// Scène de combat
export interface CombatScene extends BaseScene {
    type: 'COMBAT';
    description?: string;  // Description pré-combat optionnelle
    combat: {
        enemy: Array<{
            id: string;  // Référence vers Enemy.id
            count: number;  // Nombre de cet ennemi
        }>;
        gridSize: {
            width: number;
            height: number;
        };
        initialPositions: Array<{
            x: number;
            y: number;
        }>;
    };
    // Note: choices ne s'affiche qu'après victoire
}

// Scène de marchand
export interface MerchantScene extends BaseScene {
    type: 'MERCHANT';
    description: string;
    merchant: {
        name: string;
        portrait?: string;
        greeting?: string;  // Phrase d'accueil du marchand
    };
    inventory: Array<{
        itemId: string;  // Référence vers Item.id
        quantity: number;  // -1 pour infini
        priceMultiplier?: number;  // Modificateur de prix (1 par défaut)
    }>;
}

// Union type pour toutes les scènes
export type Scene = TextualScene | DialogueScene | CombatScene | MerchantScene;

// Interface pour l'ancienne structure (rétrocompatibilité temporaire)
export interface LegacyScene {
    id: string;
    title: string;
    description: string;
    choices: Choice[];
    requirements?: Requirement;
}

export interface Choice {
    id: string;
    text: string;
    nextSceneId: string;
    requirements?: Requirement;  // Certains choix peuvent avoir des conditions
    consequences?: Consequences;
}

export interface Consequences {
    xp?: number;
    gold?: number;
    items?: string[];  // Liste d'items à ajouter
    removeItems?: string[];  // Items à retirer (ex: utiliser une clé)
    companions?: string[];  // Nouveaux compagnons
    flags?: Record<string, boolean>;  // Flags narratifs (ex: {"a_sauve_le_marchand": true})
    damage?: number;  // Perte de HP
    heal?: number;  // Gain de HP
}

import type { CharacterClass } from './Character';

export interface Requirement {
    level?: number;
    class?: CharacterClass[];  // Classes autorisées
    items?: string[];  // Items requis
    flags?: string[];  // Flags narratifs requis
    gold?: number;  // Or minimum requis
}
