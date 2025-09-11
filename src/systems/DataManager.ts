import { WEAPON_DATABASE } from '../data/weapons';
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
        Object.values(WEAPON_DATABASE).forEach(w => this.weaponsMap.set(w.id, w));
        Object.values(spells).forEach(s => this.spellsMap.set(s.id, s));
        Object.values(enemies).forEach(e => this.enemiesMap.set(e.id, e));
        Object.values(companions).forEach(c => this.companionsMap.set(c.id, c));
        Object.values(items).forEach(i => this.itemsMap.set(i.id, i));
        
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
    
    // Debug methods
    static getAllEnemyIds(): string[] {
        return Array.from(this.enemiesMap.keys());
    }
    
    static getAllWeaponIds(): string[] {
        return Array.from(this.weaponsMap.keys());
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