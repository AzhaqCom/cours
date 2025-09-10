import type { BaseClassDefinition, ClassDefinitionConfig } from './ClassDefinition';

export class ClassFactory {
    static createClass(config: ClassDefinitionConfig): BaseClassDefinition {
        return {
            id: config.id,
            name: config.name,
            hitDie: config.hitDie,
            spellcaster: config.spellcaster,
            subclassLevel: config.subclassLevel,
            subclasses: config.subclasses,
            features: config.generateFeatures(),
            progression: config.generateProgression()
        };
    }
}