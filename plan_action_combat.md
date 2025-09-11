# 🎯 PLAN D'ACTION - Résolution des Problèmes du Système de Combat

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

### ⚡ PHASE 1 : NETTOYAGE IMMÉDIAT (30 min)
*Objectif : Supprimer le code mort et les redondances pour clarifier*

#### 1.1 Supprimer les méthodes jamais utilisées
**Fichiers à modifier :**

```typescript
// CombatManager.ts - SUPPRIMER :
- isPlayerTurn() // Dupliqué dans useCombat
- applyHealing() // Jamais utilisé
- getAliveEntities() // Jamais utilisé  
- getEntitiesInRange() // Jamais utilisé
- getCombatResult() // Jamais utilisé

// Grid.ts - SUPPRIMER :
- getEuclideanDistance()
- getEntityAtPosition()
- getOccupiedPositions()
- areAdjacent()

// Initiative.ts - SUPPRIMER :
- getCurrentRound()
- getTurnOrder()
- isEntityTurn()
- getNextEntity()
- addEntity()

// useCombat.ts - SUPPRIMER :
- Ligne 276-310 : fonction _createTestPlayerEntity() commentée
- getValidTargets() // Pas utilisé
- getValidMovePositions() // Pas utilisé
- getValidAttackPositions() // Pas utilisé
```

#### 1.2 Nettoyer les imports inutiles
```bash
# Après suppression, vérifier que le build passe encore
npm run build
```

---

### 🔧 PHASE 2 : CRÉER LE DATAMANAGER (45 min)
*Objectif : Centraliser l'accès aux données pour arrêter le hardcoding*

#### 2.1 Créer `src/systems/DataManager.ts`
```typescript
import { weapons } from '../data/weapons';
import { spells } from '../data/spells';
import { enemies } from '../data/enemies';
import { companions } from '../data/companions';
import { items } from '../data/items';
import type { Weapon } from '../types/Weapon';
import type { Spell } from '../types/Spell';
import type { CombatEntity } from '../types/CombatEntity';
import type { Companion } from '../types/Companion';
import type { Item } from '../types/Item';

export class DataManager {
    private static weaponsMap = new Map<string, Weapon>();
    private static spellsMap = new Map<string, Spell>();
    private static enemiesMap = new Map<string, CombatEntity>();
    private static companionsMap = new Map<string, Companion>();
    private static itemsMap = new Map<string, Item>();
    
    // Initialiser au démarrage
    static initialize() {
        weapons.forEach(w => this.weaponsMap.set(w.id, w));
        spells.forEach(s => this.spellsMap.set(s.id, s));
        enemies.forEach(e => this.enemiesMap.set(e.id, e));
        companions.forEach(c => this.companionsMap.set(c.id, c));
        items.forEach(i => this.itemsMap.set(i.id, i));
    }
    
    static getWeapon(id: string): Weapon | undefined {
        return this.weaponsMap.get(id);
    }
    
    static getSpell(id: string): Spell | undefined {
        return this.spellsMap.get(id);
    }
    
    static getEnemy(id: string): CombatEntity | undefined {
        return this.enemiesMap.get(id);
    }
    
    static getCompanion(id: string): Companion | undefined {
        return this.companionsMap.get(id);
    }
    
    static getItem(id: string): Item | undefined {
        return this.itemsMap.get(id);
    }
    
    // Calculer les vrais dégâts d'une arme
    static calculateWeaponDamage(weaponId: string, attackerBonus: number): number {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return 1 + attackerBonus; // Poing
        
        // Parser les dés (ex: "1d6" -> 1-6)
        const [count, sides] = weapon.damageDice.split('d').map(Number);
        let damage = 0;
        for (let i = 0; i < count; i++) {
            damage += Math.floor(Math.random() * sides) + 1;
        }
        return damage + attackerBonus;
    }
    
    // Calculer la portée d'une arme
    static getWeaponRange(weaponId: string): number {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return 1; // Poing = mêlée
        
        if (typeof weapon.range === 'number') {
            return weapon.range;
        }
        return weapon.range.max; // Pour les armes à portée variable
    }
}

// Initialiser au démarrage de l'app
DataManager.initialize();
```

#### 2.2 Mettre à jour `Actions.ts` pour utiliser DataManager
```typescript
// Dans executeAttackAction() - Remplacer ligne 213 par :
const damage = DataManager.calculateWeaponDamage(
    action.weaponId, 
    actor.entity.damageBonus
);

// Dans validateAttackAction() - Ajouter après ligne 162 :
const range = DataManager.getWeaponRange(action.weaponId);
const distance = combatState.grid.getDistance(actorPos, targetPos);
if (distance > range) {
    return { valid: false, reason: 'Cible hors de portée' };
}
```

---

### 🤝 PHASE 3 : CONNECTER COMPANIONMANAGER (1h)
*Objectif : Utiliser les vrais compagnons au lieu des tests*

#### 3.1 Mettre à jour `useCombat.ts`
```typescript
// Remplacer createTestCompanions() par :
async function loadRealCompanions(): Promise<CombatEntityInstance[]> {
    const { companions } = useCompanionStore.getState();
    const companionManager = new CompanionManager();
    
    return Array.from(companions.values())
        .filter(c => c.isActive && c.isAlive)
        .slice(0, 4) // Max 4 compagnons
        .map((companion, index) => {
            const instance = companionManager.createCombatInstance(
                companion.id,
                `companion-${companion.id}`
            );
            if (instance) {
                // Positionner les compagnons
                instance.position = { 
                    x: 1 + Math.floor(index / 2), 
                    y: 1 + (index % 2) 
                };
            }
            return instance;
        })
        .filter(Boolean) as CombatEntityInstance[];
}

// Remplacer createTestEnemies() par :
function loadRealEnemies(enemyConfig: Array<{id: string, count: number}>): CombatEntityInstance[] {
    const enemies: CombatEntityInstance[] = [];
    
    enemyConfig.forEach((config, groupIndex) => {
        const enemyData = DataManager.getEnemy(config.id);
        if (!enemyData) {
            console.error(`Ennemi non trouvé: ${config.id}`);
            return;
        }
        
        for (let i = 0; i < config.count; i++) {
            enemies.push({
                instanceId: `${config.id}-${i}`,
                entity: { ...enemyData },
                currentHp: enemyData.maxHp,
                position: { 
                    x: 6 + groupIndex, 
                    y: 2 + i 
                },
                isAlive: true,
                initiative: 0,
                hasActed: false,
                hasMoved: false
            });
        }
    });
    
    return enemies;
}

// Dans initializeCombat(), ligne 67-68 :
const companions = await loadRealCompanions();
const enemies = loadRealEnemies(scene.combat.enemy);
```

---

### 🤖 PHASE 4 : ACTIVER L'IA (1h30)
*Objectif : Faire jouer l'IA pour ennemis et compagnons*

#### 4.1 Créer un système de tour automatique dans `useCombat.ts`
```typescript
// Ajouter cette fonction :
const executeAITurn = useCallback(async (): Promise<void> => {
    if (!combatManagerRef.current || !combatState) return;
    
    const currentEntity = combatManagerRef.current.getCurrentEntity();
    if (!currentEntity) return;
    
    // Vérifier si c'est une entité IA
    const isEnemy = combatState.enemyEntities.includes(currentEntity.instanceId);
    const isCompanion = combatState.companionEntities.includes(currentEntity.instanceId);
    
    if (!isEnemy && !isCompanion) return;
    
    // Délai pour visualiser l'action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        let decision;
        
        if (isCompanion && companionAIRef.current) {
            // IA des compagnons
            decision = companionAIRef.current.makeDecision(
                currentEntity,
                combatState
            );
        } else if (isEnemy && enemyAIRef.current) {
            // IA des ennemis
            decision = enemyAIRef.current.decide(
                currentEntity,
                combatState
            );
        }
        
        if (decision) {
            // Convertir la décision en Action
            const action = convertDecisionToAction(decision, currentEntity.instanceId);
            await executePlayerAction(action);
        } else {
            // Si pas de décision, passer le tour
            advanceTurn();
        }
    } catch (error) {
        console.error('Erreur IA:', error);
        advanceTurn();
    }
}, [combatState]);

// Fonction helper pour convertir AIDecision en Action
function convertDecisionToAction(decision: AIDecision, actorId: string): Action {
    switch (decision.action) {
        case 'move':
            return {
                type: 'move',
                actorId,
                targetPosition: decision.position!
            };
        case 'attack':
            return {
                type: 'attack',
                actorId,
                targetId: decision.target!,
                weaponId: decision.weaponId!
            };
        case 'cast':
            return {
                type: 'cast',
                actorId,
                targetId: decision.target,
                spellId: decision.spellId!
            };
        case 'defend':
            return {
                type: 'defend',
                actorId
            };
        default:
            return {
                type: 'end_turn',
                actorId
            };
    }
}

// Retourner executeAITurn dans le hook
return {
    // ... existing returns
    executeAITurn
};
```

#### 4.2 Dans `CombatSceneRenderer.tsx`, ajouter l'exécution automatique de l'IA
```typescript
// Ajouter dans les imports du hook :
const { executeAITurn } = useCombat();

// Ajouter ce useEffect :
useEffect(() => {
    const checkAITurn = async () => {
        if (phase !== 'combat' || !combatState) return;
        
        const currentEntity = getCurrentEntity();
        if (!currentEntity) return;
        
        // Si ce n'est pas le tour du joueur, faire jouer l'IA
        if (!isPlayerTurn()) {
            await executeAITurn();
        }
    };
    
    checkAITurn();
}, [combatState?.initiative.currentTurnIndex, phase]);
```

---

### 💾 PHASE 5 : MIGRER VERS COMBATSTORE (1h)
*Objectif : Utiliser le store global au lieu de useState local*

#### 5.1 Mettre à jour `combatStore.ts`
```typescript
// Ajouter ces actions :
setCombatManager: (manager: CombatManager) => set({ 
    combatManager: manager 
}),

updateFromCombatManager: (manager: CombatManager) => {
    const state = manager.getCombatState();
    set({
        isInCombat: state.isActive,
        combatPhase: state.currentPhase,
        allEntities: state.entities,
        playerEntities: state.playerEntities,
        enemyEntities: state.enemyEntities,
        companionEntities: state.companionEntities,
        entityPositions: state.grid.entities,
        // ... mapper tous les états
    });
},
```

#### 5.2 Modifier `useCombat.ts` pour utiliser le store
```typescript
import { useCombatStore } from '../store/combatStore';

export function useCombat() {
    // Remplacer useState par :
    const { 
        combatState,
        updateFromCombatManager,
        setCombatManager 
    } = useCombatStore();
    
    // Dans initializeCombat, après ligne 76 :
    if (success) {
        setCombatManager(combatManager);
        updateFromCombatManager(combatManager);
    }
    
    // Dans executePlayerAction, après ligne 101 :
    if (result.success) {
        updateFromCombatManager(combatManagerRef.current);
    }
}
```

---

### ✅ PHASE 6 : TESTS D'INTÉGRATION (30 min)
*Objectif : Vérifier que tout fonctionne ensemble*

#### 6.1 Créer un fichier de test `testCombat.ts`
```typescript
export function runCombatTests() {
    console.log('🧪 Test 1: DataManager charge les données');
    console.assert(DataManager.getWeapon('sword_basic'), 'Arme trouvée');
    console.assert(DataManager.getEnemy('goblin'), 'Ennemi trouvé');
    
    console.log('🧪 Test 2: CompanionManager crée des instances');
    const manager = new CompanionManager();
    // ... tests
    
    console.log('🧪 Test 3: IA prend des décisions');
    // ... tests
    
    console.log('✅ Tous les tests passent !');
}
```

#### 6.2 Vérifier le build
```bash
npm run build
npm run dev
# Tester un combat en jeu
```

---

## ⏱️ TEMPS ESTIMÉ TOTAL : 5h

### Ordre de priorité :
1. **Phase 1** (30min) - Nettoyer pour y voir clair
2. **Phase 2** (45min) - DataManager pour les vraies données
3. **Phase 4** (1h30) - Activer l'IA (le plus important)
4. **Phase 3** (1h) - Connecter les compagnons
5. **Phase 5** (1h) - Migrer vers store (peut attendre)
6. **Phase 6** (30min) - Tests

---

## 🎯 RÉSULTAT ATTENDU

Après ces changements :
- ✅ Plus de données hardcodées
- ✅ IA qui joue automatiquement
- ✅ Vrais compagnons du CompanionManager
- ✅ Vrais ennemis de enemies.ts
- ✅ Code propre sans redondances
- ✅ État global dans combatStore
- ✅ Système utilisable pour la suite du projet

---

## ⚠️ POINTS D'ATTENTION

1. **Faire des commits après chaque phase**
2. **Tester après chaque modification majeure**
3. **Ne pas tout faire d'un coup**
4. **Garder les anciens fichiers en .backup si besoin**

---

*Ce plan te permet de reprendre le contrôle du système de combat et d'avoir une base saine pour continuer.*