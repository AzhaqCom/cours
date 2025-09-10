import type { CharacterClass } from '../../types/Character';
import type { LevelProgression, ClassFeature } from '../../types/Progression';

export interface SubclassOption {
    id: string;
    name: string;
    description: string;
    color?: string; // Pour le styling UI
}

export interface BaseClassDefinition {
    id: CharacterClass;
    name: string;
    hitDie: number;
    spellcaster: boolean;
    
    // Progression par niveau (1-20)
    progression: Record<number, LevelProgression>;
    
    // Configuration des sous-classes
    subclasses: SubclassOption[];
    subclassLevel: number; // À quel niveau choisir
    
    // Features spécifiques à la classe (réparties par niveau)
    features: ClassFeature[];
}

export interface ClassDefinitionConfig {
    // Configuration simplifiée pour créer une classe
    id: CharacterClass;
    name: string;
    hitDie: number;
    spellcaster: boolean;
    subclassLevel: number;
    subclasses: SubclassOption[];
    
    // Fonction pour générer les features par niveau
    generateFeatures: () => ClassFeature[];
    
    // Fonction pour générer la progression par niveau
    generateProgression: () => Record<number, LevelProgression>;
}