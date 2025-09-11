# 🎯 PLAN D'ACTION V2 - Résolution des Problèmes du Système de Combat
*Version révisée - On garde le code "non utilisé" qui sera nécessaire*

## 📋 ORDRE D'EXÉCUTION

### ⚡ PHASE 1 : NETTOYAGE MINIMAL (15 min)
*Objectif : Supprimer SEULEMENT les vrais doublons et code mort*

#### 1.1 Supprimer les vrais doublons
```typescript
// CombatManager.ts - SUPPRIMER :
- isPlayerTurn() // Ligne ~107-112
  // Raison : Doublon exact avec useCombat.isPlayerTurn()
  // La version de useCombat est celle utilisée partout

// useCombat.ts - SUPPRIMER :
- Lignes 276-310 : fonction _createTestPlayerEntity() commentée
  // Raison : Code commenté remplacé par createPlayerEntityFromStats()
```

#### 1.2 Corriger les TODO importants
```typescript
// Actions.ts - À COMPLÉTER :
// Ligne 163 : TODO: Vérifier la portée de l'arme
// AJOUTER après ligne 162 :
const actorPos = combatState.grid.getEntityPosition(action.actorId);
const targetPos = combatState.grid.getEntityPosition(action.targetId);
if (!actorPos || !targetPos) {
    return { valid: false, reason: 'Position non trouvée' };
}
// On ajoutera la vraie vérification de portée après le DataManager

// Ligne 179-181 : TODO: Vérifier slots sorts, portée, cible
// On le fera dans la Phase 2 avec DataManager
```

**C'EST TOUT pour la Phase 1 !** On ne supprime PAS les autres fonctions.

---

### 🔧 PHASE 2 : CRÉER LE DATAMANAGER (45 min)
*Objectif : Centraliser l'accès aux données*

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
        // Charger toutes les données
        weapons.forEach(w => this.weaponsMap.set(w.id, w));
        spells.forEach(s => this.spellsMap.set(s.id, s));
        enemies.forEach(e => this.enemiesMap.set(e.id, e));
        companions.forEach(c => this.companionsMap.set(c.id, c));
        items.forEach(i => this.itemsMap.set(i.id, i));
        
        console.log(`📚 DataManager initialisé:
            - ${this.weaponsMap.size} armes
            - ${this.spellsMap.size} sorts
            - ${this.enemiesMap.size} ennemis
            - ${this.companionsMap.size} compagnons
            - ${this.itemsMap.size} objets`);
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
        if (!weapon) {
            // Attaque à mains nues
            return Math.floor(Math.random() * 4) + 1 + attackerBonus; // 1d4 + bonus
        }
        
        // Parser les dés (ex: "1d6" -> 1-6)
        const diceMatch = weapon.damageDice.match(/(\d+)d(\d+)/);
        if (!diceMatch) return attackerBonus;
        
        const [, count, sides] = diceMatch.map(Number);
        let damage = 0;
        for (let i = 0; i < count; i++) {
            damage += Math.floor(Math.random() * sides) + 1;
        }
        
        // Ajouter bonus magique de l'arme si présent
        if (weapon.magicalBonus) {
            damage += weapon.magicalBonus;
        }
        
        return damage + attackerBonus;
    }
    
    // Calculer la portée d'une arme
    static getWeaponRange(weaponId: string): number {
        const weapon = this.getWeapon(weaponId);
        if (!weapon) return 1; // Poing = mêlée adjacente
        
        if (typeof weapon.range === 'number') {
            return weapon.range;
        }
        // Pour les armes à portée variable, prendre la max
        return weapon.range.max;
    }
    
    // Calculer les effets d'un sort
    static calculateSpellEffect(spellId: string, casterBonus: number): {
        damage?: number;
        healing?: number;
        effect?: string;
    } {
        const spell = this.getSpell(spellId);
        if (!spell) return {};
        
        const result: any = {};
        
        // Parser les dés
        const diceMatch = spell.spellEffect.dice.match(/(\d+)d(\d+)/);
        if (diceMatch) {
            const [, count, sides] = diceMatch.map(Number);
            let value = 0;
            for (let i = 0; i < count; i++) {
                value += Math.floor(Math.random() * sides) + 1;
            }
            value += spell.spellEffect.bonus + casterBonus;
            
            if (spell.spellEffect.effect === 'damage') {
                result.damage = value;
            } else if (spell.spellEffect.effect === 'heal') {
                result.healing = value;
            }
        }
        
        if (spell.spellEffect.condition) {
            result.effect = spell.spellEffect.condition;
        }
        
        return result;
    }
    
    // Obtenir la portée d'un sort
    static getSpellRange(spellId: string): number {
        const spell = this.getSpell(spellId);
        if (!spell) return 0;
        return spell.range;
    }
    
    // Vérifier si un sort peut cibler une position
    static canTargetWithSpell(spellId: string, casterPos: any, targetPos: any): boolean {
        const spell = this.getSpell(spellId);
        if (!spell) return false;
        
        // Pour l'instant, vérifier juste la portée
        // TODO: Ajouter la vérification du type de cible
        const distance = Math.abs(casterPos.x - targetPos.x) + 
                        Math.abs(casterPos.y - targetPos.y);
        return distance <= spell.range;
    }
}
```

#### 2.2 Initialiser DataManager dans `App.tsx`
```typescript
// Ajouter en haut du fichier après les imports :
import { DataManager } from './systems/DataManager';

// Ajouter avant la fonction App :
DataManager.initialize();
```

#### 2.3 Mettre à jour `Actions.ts` pour utiliser DataManager
```typescript
// Ajouter l'import en haut :
import { DataManager } from '../DataManager';

// Dans validateAttackAction(), remplacer le TODO ligne 163 par :
const actorPos = combatState.grid.getEntityPosition(action.actorId);
const targetPos = combatState.grid.getEntityPosition(action.targetId);
if (!actorPos || !targetPos) {
    return { valid: false, reason: 'Position non trouvée' };
}

const weaponRange = DataManager.getWeaponRange(action.weaponId);
const distance = combatState.grid.getDistance(actorPos, targetPos);
if (distance > weaponRange) {
    return { valid: false, reason: `Cible hors de portée (${distance} > ${weaponRange})` };
}

// Dans executeAttackAction(), remplacer ligne 213 par :
const damage = DataManager.calculateWeaponDamage(
    action.weaponId, 
    actor.entity.damageBonus
);

// Dans validateCastAction(), ajouter après ligne 177 :
if (action.targetId) {
    const casterPos = combatState.grid.getEntityPosition(action.actorId);
    const targetPos = combatState.grid.getEntityPosition(action.targetId);
    
    if (!DataManager.canTargetWithSpell(action.spellId, casterPos, targetPos)) {
        return { valid: false, reason: 'Cible invalide pour ce sort' };
    }
}

// Dans executeCastAction(), remplacer lignes 233-234 par :
const spellEffect = DataManager.calculateSpellEffect(
    action.spellId,
    actor.entity.spellModifier || 0
);

if (spellEffect.damage && action.targetId) {
    const result = this.combatManager.applyDamage(action.targetId, spellEffect.damage);
    if (result.success) {
        actor.hasActed = true;
    }
    return result;
} else if (spellEffect.healing && action.targetId) {
    const result = this.combatManager.applyHealing(action.targetId, spellEffect.healing);
    if (result.success) {
        actor.hasActed = true;
    }
    return result;
}
```

---

### 🤝 PHASE 3 : CONNECTER LES VRAIS COMPAGNONS (1h)
*Objectif : Utiliser CompanionManager et les vrais compagnons*

#### 3.1 Connecter CompanionManager au companionStore
```typescript
// Dans companionStore.ts, ajouter :
companionManager: new CompanionManager(),

// Dans les actions, ajouter :
getCompanionForCombat: (companionId: string) => {
    const state = get();
    const companion = state.companions.get(companionId);
    if (!companion) return null;
    
    return state.companionManager.createCombatInstance(
        companionId,
        `companion-${companionId}`
    );
}
```

#### 3.2 Mettre à jour `useCombat.ts`
```typescript
import { useCompanionStore } from '../store/companionStore';

// Remplacer createTestCompanions() par :
function loadActiveCompanions(): CombatEntityInstance[] {
    const companionStore = useCompanionStore.getState();
    const activeCompanions: CombatEntityInstance[] = [];
    
    // Récupérer les compagnons actifs
    let index = 0;
    for (const companionId of companionStore.activeCompanions) {
        if (index >= 4) break; // Max 4 compagnons
        
        const instance = companionStore.getCompanionForCombat(companionId);
        if (instance) {
            // Positionner le compagnon sur la grille
            instance.position = {
                x: 1 + Math.floor(index / 2),
                y: 1 + (index % 2)
            };
            activeCompanions.push(instance);
            index++;
        }
    }
    
    // Si pas de compagnons, créer un compagnon de test
    if (activeCompanions.length === 0) {
        console.warn('Aucun compagnon actif, création d\'un compagnon de test');
        return createTestCompanions(); // Garder la fonction de test en fallback
    }
    
    return activeCompanions;
}

// Remplacer createTestEnemies() par :
function loadEnemiesFromData(enemyConfig: Array<{id: string, count: number}>): CombatEntityInstance[] {
    const enemies: CombatEntityInstance[] = [];
    
    enemyConfig.forEach((config, groupIndex) => {
        const enemyData = DataManager.getEnemy(config.id);
        if (!enemyData) {
            console.error(`⚠️ Ennemi non trouvé: ${config.id}`);
            // Créer un ennemi par défaut
            const defaultEnemy: CombatEntity = {
                id: config.id,
                name: config.id,
                maxHp: 30,
                ac: 12,
                movement: 4,
                stats: {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10
                },
                weaponIds: ['unarmed'],
                attackBonus: 2,
                damageBonus: 0,
                aiRole: 'skirmisher',
                aiPriorities: ['melee_attack']
            };
            
            for (let i = 0; i < config.count; i++) {
                enemies.push({
                    instanceId: `${config.id}-${i}`,
                    entity: defaultEnemy,
                    currentHp: defaultEnemy.maxHp,
                    position: { x: 6 + groupIndex, y: 2 + i },
                    isAlive: true,
                    initiative: 0,
                    hasActed: false,
                    hasMoved: false
                });
            }
            return;
        }
        
        // Créer les instances d'ennemis
        for (let i = 0; i < config.count; i++) {
            enemies.push({
                instanceId: `${config.id}-${i}`,
                entity: { ...enemyData }, // Copie pour éviter les mutations
                currentHp: enemyData.maxHp,
                position: { 
                    x: Math.min(7, 5 + groupIndex), // Max x = 7
                    y: Math.min(5, 2 + i) // Max y = 5
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

// Dans initializeCombat(), lignes 67-68 :
const companions = loadActiveCompanions();
const enemies = loadEnemiesFromData(scene.combat.enemy);
```

---

### 🤖 PHASE 4 : ACTIVER L'IA (1h30)
*Objectif : Faire jouer l'IA automatiquement*

#### 4.1 Implémenter les méthodes manquantes dans `CompanionAI.ts`
```typescript
// Dans CompanionAI.ts, compléter makeDecision() :
export class CompanionAIManager {
    makeDecision(entity: CombatEntityInstance, combatState: CombatState): AIDecision | null {
        // Utiliser l'AICore existant avec le rôle du compagnon
        const aiController = new AIController();
        
        // Enregistrer le comportement selon le rôle
        switch (entity.entity.aiRole) {
            case 'tank':
                aiController.registerEvaluator('tank', new TankBehavior());
                break;
            case 'support':
                aiController.registerEvaluator('support', new SupportBehavior());
                break;
            case 'archer':
                aiController.registerEvaluator('archer', new ArcherBehavior());
                break;
            default:
                aiController.registerEvaluator('skirmisher', new SkirmisherBehavior());
        }
        
        return aiController.decide(entity, combatState);
    }
}
```

#### 4.2 Ajouter l'exécution automatique de l'IA dans `useCombat.ts`
```typescript
// Ajouter cette fonction :
const executeAITurn = useCallback(async (): Promise<boolean> => {
    if (!combatManagerRef.current || !combatState) return false;
    
    const currentEntity = combatManagerRef.current.getCurrentEntity();
    if (!currentEntity) return false;
    
    // Vérifier si c'est une entité IA
    const isPlayer = combatState.playerEntities.includes(currentEntity.instanceId);
    if (isPlayer) return false; // Le joueur joue manuellement
    
    const isCompanion = combatState.companionEntities.includes(currentEntity.instanceId);
    const isEnemy = combatState.enemyEntities.includes(currentEntity.instanceId);
    
    if (!isCompanion && !isEnemy) return false;
    
    console.log(`🤖 Tour IA: ${currentEntity.entity.name}`);
    
    try {
        let decision: AIDecision | null = null;
        
        if (isCompanion && companionAIRef.current) {
            decision = companionAIRef.current.makeDecision(currentEntity, combatState);
            console.log(`🛡️ Décision compagnon:`, decision);
        } else if (isEnemy && enemyAIRef.current) {
            decision = enemyAIRef.current.decide(currentEntity, combatState);
            console.log(`⚔️ Décision ennemi:`, decision);
        }
        
        if (decision && decision.action !== 'end_turn') {
            // Convertir la décision en action
            const action = convertDecisionToAction(decision, currentEntity.instanceId);
            const result = await executePlayerAction(action);
            
            // Petit délai pour visualiser
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Si l'action a réussi et l'entité peut encore agir
            if (result && !currentEntity.hasActed) {
                // L'IA peut faire une deuxième action (mouvement si pas bougé)
                if (!currentEntity.hasMoved && decision.action !== 'move') {
                    const moveDecision = enemyAIRef.current?.decide(currentEntity, combatState);
                    if (moveDecision && moveDecision.action === 'move') {
                        const moveAction = convertDecisionToAction(moveDecision, currentEntity.instanceId);
                        await executePlayerAction(moveAction);
                    }
                }
            }
        }
        
        // Terminer le tour
        await new Promise(resolve => setTimeout(resolve, 500));
        advanceTurn();
        return true;
        
    } catch (error) {
        console.error('Erreur IA:', error);
        advanceTurn();
        return false;
    }
}, [combatState, executePlayerAction, advanceTurn]);

// Helper pour convertir AIDecision en Action
function convertDecisionToAction(decision: AIDecision, actorId: string): Action {
    switch (decision.action) {
        case 'move':
            return {
                type: 'move',
                actorId,
                targetPosition: decision.position!
            } as MoveAction;
            
        case 'attack':
            return {
                type: 'attack',
                actorId,
                targetId: decision.target!,
                weaponId: decision.weaponId || 'unarmed'
            } as AttackAction;
            
        case 'cast':
            return {
                type: 'cast',
                actorId,
                targetId: decision.target,
                spellId: decision.spellId!,
                targetPosition: decision.position
            } as CastSpellAction;
            
        case 'defend':
            return {
                type: 'defend',
                actorId
            } as DefendAction;
            
        default:
            return {
                type: 'end_turn',
                actorId
            } as EndTurnAction;
    }
}

// Ajouter dans le return du hook :
return {
    // ... existing
    executeAITurn
};
```

#### 4.3 Connecter l'IA dans `CombatSceneRenderer.tsx`
```typescript
// Ajouter dans les extractions du hook :
const {
    // ... existing
    executeAITurn
} = useCombat();

// Ajouter ce useEffect pour l'exécution automatique :
useEffect(() => {
    if (phase !== 'combat' || !combatState) return;
    
    const handleAITurn = async () => {
        if (!isPlayerTurn()) {
            // Petit délai pour que le joueur voie le changement de tour
            await new Promise(resolve => setTimeout(resolve, 1000));
            await executeAITurn();
        }
    };
    
    handleAITurn();
}, [combatState?.initiative?.currentTurnIndex, phase, isPlayerTurn, executeAITurn]);
```

---

### 💾 PHASE 5 : MIGRER VERS COMBATSTORE (1h)
*Cette phase peut attendre, le système fonctionne avec useState*

---

### ✅ PHASE 6 : TESTS (30 min)

#### 6.1 Ajouter des logs de debug
```typescript
// Dans CombatManager.initializeCombat(), après ligne 83 :
console.log(`⚔️ Combat initialisé:
    - ${allEntities.length} entités totales
    - Joueur: ${playerEntity.entity.name}
    - Compagnons: ${companions.map(c => c.entity.name).join(', ')}
    - Ennemis: ${enemies.map(e => e.entity.name).join(', ')}
`);

// Dans Initiative.rollInitiative(), après ligne 47 :
console.log('🎲 Ordre d\'initiative:', 
    this.turnOrder.map(e => `${e.entity.entity.name}: ${e.initiative}`)
);
```

#### 6.2 Vérifier que tout compile
```bash
npm run build
```

---

## ⏱️ TEMPS ESTIMÉ RÉVISÉ : 4h30

1. **Phase 1** : 15 min (beaucoup moins de suppressions)
2. **Phase 2** : 45 min (DataManager)
3. **Phase 3** : 1h (Compagnons)
4. **Phase 4** : 1h30 (IA)
5. **Phase 5** : OPTIONNEL
6. **Phase 6** : 30 min (Tests)

---

## 🎯 RÉSULTAT ATTENDU

Après ces 4 phases principales :
- ✅ Code propre sans vrais doublons
- ✅ Données réelles chargées via DataManager
- ✅ Vrais compagnons du store
- ✅ IA qui joue automatiquement
- ✅ Système de combat fonctionnel de bout en bout

La Phase 5 (combatStore) peut être faite plus tard quand le système sera stable.