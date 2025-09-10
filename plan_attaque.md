# 🎯 PLAN D'ATTAQUE - RPG D&D React/TypeScript

## Phase 1: Refonte des Types de Base (2h)

### 1.1 Refactoring Enemy → CombatEntity
- [x] **Fichier:** `src/types/CombatEntity.ts`
```typescript
interface CombatEntity {
    id: string;
    name: string;
    
    // Stats de base
    maxHp: number;
    ac: number;
    movement: number;  // En CASES
    initiative: number;  // Modificateur DEX
    
    // Option A: Références
    weaponIds: string[];
    attackBonus: number;
    damageBonus: number;
    spellIds?: string[];
    spellModifier?: number;
    
    // IA
    aiRole: AIRole;
    aiPriorities: AIAction[];
}
```

### 1.2 Création du type Companion
- [x] **Fichier:** `src/types/Companion.ts`
```typescript
interface Companion extends CombatEntity {
    level: number;
    xp: number;
    
    // Inventaire propre
    inventory: InventoryItem[];
    equipped: {
        mainHand?: string;
        offHand?: string;
        armor?: string;
        accessory?: string;
    };
    
    // Progression simplifiée
    progressionPath: 'warrior' | 'mage' | 'support';
}
```

### 1.3 Refonte Weapon
- [x] **Fichier:** `src/types/Weapon.ts`
- [x] Séparation des stats de base (1d6) des modificateurs
- [x] Portée en CASES
- [x] Support armes 2 mains

### 1.4 Refonte Spell
- [x] **Fichier:** `src/types/Spell.ts`
- [x] Portée en CASES
- [x] Target types: `self | touch | ally | allies | enemy | area`
- [x] Spell slots par niveau

## Phase 2: Système de Combat (3h)

### 2.1 Grid System
- [x] **Fichier:** `src/systems/combat/Grid.ts`
```typescript
class CombatGrid {
    width: number;
    height: number;
    entities: Map<string, Position>;
    
    moveEntity(id: string, to: Position): boolean
    getDistance(from: Position, to: Position): number
    getEntitiesInRange(from: Position, range: number): Entity[]
    isValidMove(from: Position, to: Position, movement: number): boolean
}
```

### 2.2 Initiative System
- [x] **Fichier:** `src/systems/combat/Initiative.ts`
```typescript
class InitiativeTracker {
    rollInitiative(entities: CombatEntity[]): OrderedEntity[]
    getCurrentTurn(): string
    nextTurn(): void
}
```

### 2.3 Combat Manager
- [x] **Fichier:** `src/systems/combat/CombatManager.ts`
- [x] Gestion des tours
- [x] Résolution des attaques
- [x] Application des dégâts
- [x] Conditions de victoire/défaite

### 2.4 Action System
- [x] **Fichier:** `src/systems/combat/Actions.ts`
- [x] Move, Attack, Cast, UseItem
- [x] Validation des actions
- [x] Application des effets

## Phase 3: Système d'IA (2h)

### 3.1 AI Core
- [x] **Fichier:** `src/systems/ai/AICore.ts`
```typescript
interface AIDecision {
    action: 'move' | 'attack' | 'cast' | 'defend';
    target?: string;
    position?: Position;
    weaponId?: string;
    spellId?: string;
}

class AIController {
    decide(entity: CombatEntity, combat: CombatState): AIDecision
}
```

### 3.2 AI Behaviors
- [x] **Fichier:** `src/systems/ai/Behaviors.ts`
- [x] Skirmisher: Hit & run
- [x] Archer: Maintain distance
- [x] Tank: Protect allies
- [x] Caster: Prioritize spells
- [x] Support: Heal/buff allies

### 3.3 AI Evaluator
- [x] **Fichier:** `src/systems/ai/Evaluator.ts`
- [x] Évaluation des menaces
- [x] Calcul des priorités
- [x] Optimisation des positions

## Phase 4: Système de Compagnons (2h)

### 4.1 Companion Manager
- [x] **Fichier:** `src/systems/CompanionManager.ts`
- [x] Limite de 4 compagnons
- [x] Ajout via consequences
- [x] Gestion inventaire

### 4.2 Companion Progression
- [x] **Fichier:** `src/systems/CompanionProgression.ts`
- [x] Auto level-up
- [x] Attribution des stats
- [x] Nouveaux sorts/armes

## Phase 5: Renderers de Scènes (3h) ✅ TERMINÉ

### 5.1 Combat Renderer
- [x] **Fichier:** `src/components/scenes/CombatSceneRenderer.tsx`
- [x] Affichage grille
- [x] Contrôles joueur (clic pour move/attack)
- [x] UI de combat (HP bars, turn order)
- [x] Animations basiques

### 5.2 Dialogue Renderer
- [x] **Fichier:** `src/components/scenes/DialogueSceneRenderer.tsx`
- [x] Portrait PNJ
- [x] Boîte de dialogue
- [x] Choix contextuels

### 5.3 Merchant Renderer
- [x] **Fichier:** `src/components/scenes/MerchantSceneRenderer.tsx`
- [x] Interface achat/vente
- [x] Gestion inventaire
- [x] Comparaison équipement

### 5.4 Scene Manager
- [x] **Fichier:** `src/components/SceneManager.tsx`
```typescript
function SceneManager({ scene }: { scene: Scene }) {
    switch(scene.type) {
        case 'TEXTUAL': return <TextualSceneRenderer scene={scene} />
        case 'DIALOGUE': return <DialogueSceneRenderer scene={scene} />
        case 'COMBAT': return <CombatSceneRenderer scene={scene} />
        case 'MERCHANT': return <MerchantSceneRenderer scene={scene} />
    }
}
```

### 5.5 Intégration Système ✅ BONUS
- [x] **Fichier:** `src/store/sceneStore.ts` - Store Zustand dédié aux scènes
- [x] **Fichier:** `src/components/GameView.tsx` - Intégration SceneManager
- [x] **Fichier:** `src/styles/scene-manager.css` - Styles globaux
- [x] **Scènes d'exemple** étendues avec tous types (TEXTUAL, DIALOGUE, COMBAT, MERCHANT)
- [x] **Gestion d'erreurs** robuste et validation des scènes
- [x] **Synchronisation** avec gameStore existant
- [x] **Navigation** avec historique et fonctions back/reset
- [x] **Build TypeScript** sans erreurs (0 errors)

## Phase 6: Intégration Inventaire (1h) ✅ TERMINÉ

### 6.1 Inventory UI
- [x] **Fichier:** `src/components/inventory/InventoryPanel.tsx`
- [x] Drag & drop équipement
- [x] Comparaison stats
- [x] Usage consommables

### 6.2 Equipment Manager
- [x] **Fichier:** `src/systems/EquipmentManager.ts`
- [x] Validation slots
- [x] Application des bonus
- [x] Gestion 2 mains

## Phase 7: Store & State Management (1h)

### 7.1 Combat Store ✅ TERMINÉ
- [x] **Fichier:** `src/store/combatStore.ts`
- [x] État du combat
- [x] Positions
- [x] Tours

### 7.2 Companion Store ✅ TERMINÉ
- [x] **Fichier:** `src/store/companionStore.ts`
- [x] Liste des compagnons
- [x] Inventaires
- [x] Progression

### 7.3 Inventory Store ✅ AMÉLIORÉ
- [x] **Fichier:** `src/store/inventoryStore.ts`
- [x] Items du joueur
- [x] Équipement actuel
- [x] Persistence localStorage
- [x] Transactions et statistiques

## Phase 8: Data & Content (1h)

### 8.1 Weapons Database ✅ TERMINÉ
- [x] **Fichier:** `src/data/weapons.ts`
- [x] Armes de base D&D
- [x] Dégâts et portée en CASES

### 8.2 Spells Database ✅ TERMINÉ
- [x] **Fichier:** `src/data/spells.ts`
- [x] Conversion portée en CASES
- [x] Target types corrects

### 8.3 Enemies Database ✅ TERMINÉ
- [x] **Fichier:** `src/data/enemies.ts`
- [x] Refactor avec Option A (weaponIds, spellIds)

### 8.4 Companions Database ✅ TERMINÉ
- [x] **Fichier:** `src/data/companions.ts`
- [x] Compagnons disponibles

## Phase 9: Polish & Tests (2h)

### 9.1 CSS & Animations
- [ ] Transitions combat
- [ ] Hover effects grille
- [ ] Feedback visuel actions

### 9.2 Sound Effects
- [ ] Sons d'attaque
- [ ] Bruits de pas
- [ ] Ambiance combat

### 9.3 Balance
- [ ] Ajustement difficultés
- [ ] Test progression
- [ ] Vérification IA

## 📊 Ordre d'Exécution Recommandé

1. **Semaine 1:** Phases 1-2-3 (Types + Combat + IA)
2. **Semaine 2:** Phases 4-5 (Compagnons + Renderers)
3. **Semaine 3:** Phases 6-7-8 (Inventaire + State + Data)
4. **Semaine 4:** Phase 9 (Polish)

## ⚠️ Points d'Attention

1. **TOUJOURS en CASES** - Aucune autre unité
2. **IDs partout** - Pas de duplication
3. **TypeScript strict** - Pas de any
4. **IA partagée** - Même système ennemis/compagnons
5. **Pas de god components** - Découpage modulaire

## 🚫 Pièges à Éviter

1. Ne pas mélanger les unités (cases/mètres)
2. Ne pas dupliquer la logique IA
3. Ne pas hardcoder les stats dans les scènes
4. Ne pas oublier les slots de sorts
5. Ne pas rendre les compagnons contrôlables

## ✅ Critères de Succès

- [ ] `npm run build` retourne 0 erreur
- [ ] Combat tactique sur grille fonctionnel
- [ ] IA variée et intelligente
- [ ] 4 types de scènes opérationnels
- [ ] Compagnons avec inventaire propre
- [ ] Sorts utilisables en/hors combat
- [ ] Système marchand complet
- [ ] Performance fluide
- [ ] Code maintenable et extensible

---

**Prêt à commencer ? On attaque par la Phase 1 !**