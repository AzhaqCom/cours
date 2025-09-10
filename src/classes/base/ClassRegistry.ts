import type { CharacterClass } from '../../types/Character';
import type { BaseClassDefinition, SubclassOption } from './ClassDefinition';
import type { LevelProgression, ClassFeature } from '../../types/Progression';

export class ClassRegistry {
    private static instance: ClassRegistry;
    private classes = new Map<CharacterClass, BaseClassDefinition>();

    private constructor() {}

    static getInstance(): ClassRegistry {
        if (!ClassRegistry.instance) {
            ClassRegistry.instance = new ClassRegistry();
        }
        return ClassRegistry.instance;
    }

    register(classDef: BaseClassDefinition): void {
        this.classes.set(classDef.id, classDef);
    }

    getClass(classId: CharacterClass): BaseClassDefinition | undefined {
        return this.classes.get(classId);
    }

    getProgression(classId: CharacterClass, level: number): LevelProgression | undefined {
        const classDef = this.getClass(classId);
        return classDef?.progression[level];
    }

    getSubclasses(classId: CharacterClass): SubclassOption[] {
        const classDef = this.getClass(classId);
        return classDef?.subclasses || [];
    }

    getClassFeatures(classId: CharacterClass, level: number): ClassFeature[] {
        const classDef = this.getClass(classId);
        if (!classDef) return [];
        
        return classDef.features.filter(feature => feature.level === level);
    }

    canChooseSubclass(classId: CharacterClass, level: number): boolean {
        const classDef = this.getClass(classId);
        return classDef?.subclassLevel === level;
    }

    getAllClasses(): BaseClassDefinition[] {
        return Array.from(this.classes.values());
    }
}