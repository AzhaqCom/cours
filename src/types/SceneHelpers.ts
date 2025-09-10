import type { 
    Scene, 
    TextualScene, 
    DialogueScene, 
    CombatScene, 
    MerchantScene
} from './Scene';

// Type guards pour identifier le type de scène
export function isTextualScene(scene: Scene): scene is TextualScene {
    return scene.type === 'TEXTUAL';
}

export function isDialogueScene(scene: Scene): scene is DialogueScene {
    return scene.type === 'DIALOGUE';
}

export function isCombatScene(scene: Scene): scene is CombatScene {
    return scene.type === 'COMBAT';
}

export function isMerchantScene(scene: Scene): scene is MerchantScene {
    return scene.type === 'MERCHANT';
}

// Helper pour créer des scènes avec type safety
export const SceneFactory = {
    createTextual: (
        id: string,
        title: string,
        description: string,
        choices: Scene['choices']
    ): TextualScene => ({
        id,
        title,
        type: 'TEXTUAL',
        description,
        choices
    }),

    createDialogue: (
        id: string,
        title: string,
        npc: DialogueScene['npc'],
        choices: Scene['choices'],
        description?: string
    ): DialogueScene => ({
        id,
        title,
        type: 'DIALOGUE',
        npc,
        choices,
        description
    }),

    createCombat: (
        id: string,
        title: string,
        combat: CombatScene['combat'],
        choices: Scene['choices'],
        description?: string
    ): CombatScene => ({
        id,
        title,
        type: 'COMBAT',
        combat,
        choices,
        description
    }),

    createMerchant: (
        id: string,
        title: string,
        merchant: MerchantScene['merchant'],
        inventory: MerchantScene['inventory'],
        description: string,
        choices: Scene['choices']
    ): MerchantScene => ({
        id,
        title,
        type: 'MERCHANT',
        merchant,
        inventory,
        description,
        choices
    })
};

// Helper pour migrer les anciennes scènes
export function migrateOldScene(oldScene: any): TextualScene {
    return {
        id: oldScene.id,
        title: oldScene.title,
        type: 'TEXTUAL',
        description: oldScene.description,
        choices: oldScene.choices,
        requirements: oldScene.requirements
    };
}