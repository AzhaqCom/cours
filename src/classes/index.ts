import { ClassRegistry } from './base/ClassRegistry';
import { WizardClass } from './wizard/WizardClass';
import { FighterClass } from './fighter/FighterClass';
import { RogueClass } from './rogue/RogueClass';
import { SorcererClass } from './sorcerer/SorcererClass';

// Initialiser le registry avec toutes les classes
export function initializeClasses(): ClassRegistry {
    const registry = ClassRegistry.getInstance();
    
    // Enregistrer toutes les classes
    registry.register(WizardClass);
    registry.register(FighterClass);
    registry.register(RogueClass);
    registry.register(SorcererClass);
    
    return registry;
}

// Export du registry pour utilisation dans l'app
export const classRegistry = initializeClasses();

// Exports pour utilisation directe si nécessaire
export { ClassRegistry } from './base/ClassRegistry';
export { WizardClass, FighterClass, RogueClass, SorcererClass };