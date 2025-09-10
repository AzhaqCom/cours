import type { Weapon } from '../types/Weapon';

// Base de données des armes D&D 5e adaptées pour le combat tactique
// Toutes les portées sont en CASES (1 case = 5 pieds D&D)

export const WEAPON_DATABASE: Record<string, Weapon> = {
    // === ARMES SIMPLES ===
    
    // Armes de mêlée simples
    'club': {
        id: 'club',
        name: 'Gourdin',
        type: 'simple',
        category: 'melee',
        damageDice: '1d4',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 }, // Mêlée = 1 case
        properties: ['light', 'thrown'],
        weight: 2,
        value: 1, // en pièces d'or
        rarity: 'common',
        description: 'Une simple matraque en bois.',
        requirements: {
            proficiency: ['simple']
        },
        thrownRange: { min: 1, max: 4 }, // 20 pieds = 4 cases
        twoHanded: false
    },

    'dagger': {
        id: 'dagger',
        name: 'Dague',
        type: 'simple',
        category: 'melee',
        damageDice: '1d4',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['finesse', 'light', 'thrown'],
        weight: 1,
        value: 2,
        rarity: 'common',
        description: 'Une lame courte et aiguisée.',
        requirements: {
            proficiency: ['simple']
        },
        thrownRange: { min: 1, max: 4 }, // 20 pieds
        twoHanded: false
    },

    'handaxe': {
        id: 'handaxe',
        name: 'Hachette',
        type: 'simple',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['light', 'thrown'],
        weight: 2,
        value: 5,
        rarity: 'common',
        description: 'Une hache légère à une main.',
        requirements: {
            proficiency: ['simple']
        },
        thrownRange: { min: 1, max: 4 }, // 20 pieds
        twoHanded: false
    },

    'javelin': {
        id: 'javelin',
        name: 'Javelot',
        type: 'simple',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['thrown'],
        weight: 2,
        value: 5,
        rarity: 'common',
        description: 'Une lance légère conçue pour être lancée.',
        requirements: {
            proficiency: ['simple']
        },
        thrownRange: { min: 1, max: 6 }, // 30 pieds = 6 cases
        twoHanded: false
    },

    'mace': {
        id: 'mace',
        name: 'Masse d\'armes',
        type: 'simple',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: [],
        weight: 4,
        value: 5,
        rarity: 'common',
        description: 'Une arme lourde avec une tête de métal.',
        requirements: {
            proficiency: ['simple']
        },
        twoHanded: false
    },

    'quarterstaff': {
        id: 'quarterstaff',
        name: 'Bâton',
        type: 'simple',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: ['versatile'],
        weight: 4,
        value: 2,
        rarity: 'common',
        description: 'Un long bâton de bois dur.',
        requirements: {
            proficiency: ['simple']
        },
        versatileDamage: '1d8', // Dégâts à 2 mains
        twoHanded: false
    },

    'spear': {
        id: 'spear',
        name: 'Lance',
        type: 'simple',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['thrown', 'versatile'],
        weight: 3,
        value: 1,
        rarity: 'common',
        description: 'Une arme d\'hast avec une pointe acérée.',
        requirements: {
            proficiency: ['simple']
        },
        thrownRange: { min: 1, max: 4 }, // 20 pieds
        versatileDamage: '1d8',
        twoHanded: false
    },

    // Armes à distance simples
    'light_crossbow': {
        id: 'light_crossbow',
        name: 'Arbalète légère',
        type: 'simple',
        category: 'ranged',
        damageDice: '1d8',
        damageType: 'piercing',
        range: { min: 2, max: 16 }, // 80 pieds normaux = 16 cases
        properties: ['ammunition', 'loading', 'two_handed'],
        weight: 5,
        value: 25,
        rarity: 'common',
        description: 'Une arbalète compacte et facile à manier.',
        requirements: {
            proficiency: ['simple']
        },
        maxRange: 32, // 160 pieds max = 32 cases
        twoHanded: true,
        ammunitionType: 'crossbow_bolt'
    },

    'dart': {
        id: 'dart',
        name: 'Fléchette',
        type: 'simple',
        category: 'ranged',
        damageDice: '1d4',
        damageType: 'piercing',
        range: { min: 1, max: 4 }, // 20 pieds = 4 cases
        properties: ['finesse', 'thrown'],
        weight: 0.25,
        value: 0.05, // 5 centièmes d'or
        rarity: 'common',
        description: 'Une petite pointe acérée.',
        requirements: {
            proficiency: ['simple']
        },
        maxRange: 12, // 60 pieds max
        twoHanded: false
    },

    'shortbow': {
        id: 'shortbow',
        name: 'Arc court',
        type: 'simple',
        category: 'ranged',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 2, max: 16 }, // 80 pieds = 16 cases
        properties: ['ammunition', 'two_handed'],
        weight: 2,
        value: 25,
        rarity: 'common',
        description: 'Un arc compact et maniable.',
        requirements: {
            proficiency: ['simple']
        },
        maxRange: 32, // 160 pieds max
        twoHanded: true,
        ammunitionType: 'arrow'
    },

    'sling': {
        id: 'sling',
        name: 'Fronde',
        type: 'simple',
        category: 'ranged',
        damageDice: '1d4',
        damageType: 'bludgeoning',
        range: { min: 2, max: 6 }, // 30 pieds = 6 cases
        properties: ['ammunition'],
        weight: 0,
        value: 1,
        rarity: 'common',
        description: 'Une lanière de cuir pour lancer des pierres.',
        requirements: {
            proficiency: ['simple']
        },
        maxRange: 24, // 120 pieds max
        twoHanded: false,
        ammunitionType: 'sling_bullet'
    },

    // === ARMES MARTIALES ===

    // Armes de mêlée martiales
    'battleaxe': {
        id: 'battleaxe',
        name: 'Hache d\'armes',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['versatile'],
        weight: 4,
        value: 10,
        rarity: 'common',
        description: 'Une hache lourde de guerre.',
        requirements: {
            proficiency: ['martial']
        },
        versatileDamage: '1d10',
        twoHanded: false
    },

    'flail': {
        id: 'flail',
        name: 'Fléau d\'armes',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: [],
        weight: 2,
        value: 10,
        rarity: 'common',
        description: 'Une chaîne avec une boule de métal.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'glaive': {
        id: 'glaive',
        name: 'Glaive',
        type: 'martial',
        category: 'melee',
        damageDice: '1d10',
        damageType: 'slashing',
        range: { min: 1, max: 2 }, // Reach = 2 cases
        properties: ['heavy', 'reach', 'two_handed'],
        weight: 6,
        value: 20,
        rarity: 'common',
        description: 'Une lame courbe montée sur un long manche.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'greataxe': {
        id: 'greataxe',
        name: 'Grande hache',
        type: 'martial',
        category: 'melee',
        damageDice: '1d12',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['heavy', 'two_handed'],
        weight: 7,
        value: 30,
        rarity: 'common',
        description: 'Une énorme hache à deux mains.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'greatsword': {
        id: 'greatsword',
        name: 'Épée à deux mains',
        type: 'martial',
        category: 'melee',
        damageDice: '2d6',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['heavy', 'two_handed'],
        weight: 6,
        value: 50,
        rarity: 'common',
        description: 'Une longue épée lourde.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'halberd': {
        id: 'halberd',
        name: 'Hallebarde',
        type: 'martial',
        category: 'melee',
        damageDice: '1d10',
        damageType: 'slashing',
        range: { min: 1, max: 2 }, // Reach
        properties: ['heavy', 'reach', 'two_handed'],
        weight: 6,
        value: 20,
        rarity: 'common',
        description: 'Une arme d\'hast polyvalente.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'lance': {
        id: 'lance',
        name: 'Lance de cavalerie',
        type: 'martial',
        category: 'melee',
        damageDice: '1d12',
        damageType: 'piercing',
        range: { min: 1, max: 2 }, // Reach
        properties: ['reach', 'special'],
        weight: 6,
        value: 10,
        rarity: 'common',
        description: 'Une longue lance de cavalier.',
        requirements: {
            proficiency: ['martial']
        },
        specialRules: ['Désavantage contre cibles adjacentes sans monture'],
        twoHanded: true
    },

    'longsword': {
        id: 'longsword',
        name: 'Épée longue',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['versatile'],
        weight: 3,
        value: 15,
        rarity: 'common',
        description: 'L\'épée classique du chevalier.',
        requirements: {
            proficiency: ['martial']
        },
        versatileDamage: '1d10',
        twoHanded: false
    },

    'maul': {
        id: 'maul',
        name: 'Maillet',
        type: 'martial',
        category: 'melee',
        damageDice: '2d6',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: ['heavy', 'two_handed'],
        weight: 10,
        value: 10,
        rarity: 'common',
        description: 'Un énorme marteau de guerre.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'morningstar': {
        id: 'morningstar',
        name: 'Morgenstern',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: [],
        weight: 4,
        value: 15,
        rarity: 'common',
        description: 'Une masse hérissée de pointes.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'pike': {
        id: 'pike',
        name: 'Pique',
        type: 'martial',
        category: 'melee',
        damageDice: '1d10',
        damageType: 'piercing',
        range: { min: 1, max: 2 }, // Reach
        properties: ['heavy', 'reach', 'two_handed'],
        weight: 18,
        value: 5,
        rarity: 'common',
        description: 'Une très longue lance d\'infanterie.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: true
    },

    'rapier': {
        id: 'rapier',
        name: 'Rapière',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['finesse'],
        weight: 2,
        value: 25,
        rarity: 'common',
        description: 'Une épée fine et élégante.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'scimitar': {
        id: 'scimitar',
        name: 'Cimeterre',
        type: 'martial',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['finesse', 'light'],
        weight: 3,
        value: 25,
        rarity: 'common',
        description: 'Une lame courbe et légère.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'shortsword': {
        id: 'shortsword',
        name: 'Épée courte',
        type: 'martial',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['finesse', 'light'],
        weight: 2,
        value: 10,
        rarity: 'common',
        description: 'Une épée courte et maniable.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'trident': {
        id: 'trident',
        name: 'Trident',
        type: 'martial',
        category: 'melee',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: ['thrown', 'versatile'],
        weight: 4,
        value: 5,
        rarity: 'common',
        description: 'Une lance à trois pointes.',
        requirements: {
            proficiency: ['martial']
        },
        thrownRange: { min: 1, max: 4 }, // 20 pieds
        versatileDamage: '1d8',
        twoHanded: false
    },

    'war_pick': {
        id: 'war_pick',
        name: 'Pic de guerre',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'piercing',
        range: { min: 1, max: 1 },
        properties: [],
        weight: 2,
        value: 5,
        rarity: 'common',
        description: 'Un pic acéré monté sur manche.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    'warhammer': {
        id: 'warhammer',
        name: 'Marteau de guerre',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: ['versatile'],
        weight: 2,
        value: 15,
        rarity: 'common',
        description: 'Un marteau d\'armes robuste.',
        requirements: {
            proficiency: ['martial']
        },
        versatileDamage: '1d10',
        twoHanded: false
    },

    'whip': {
        id: 'whip',
        name: 'Fouet',
        type: 'martial',
        category: 'melee',
        damageDice: '1d4',
        damageType: 'slashing',
        range: { min: 1, max: 2 }, // Reach
        properties: ['finesse', 'reach'],
        weight: 3,
        value: 2,
        rarity: 'common',
        description: 'Un long fouet en cuir.',
        requirements: {
            proficiency: ['martial']
        },
        twoHanded: false
    },

    // Armes à distance martiales
    'blowgun': {
        id: 'blowgun',
        name: 'Sarbacane',
        type: 'martial',
        category: 'ranged',
        damageDice: '1',
        damageType: 'piercing',
        range: { min: 2, max: 5 }, // 25 pieds = 5 cases
        properties: ['ammunition', 'loading'],
        weight: 1,
        value: 10,
        rarity: 'common',
        description: 'Un tube pour lancer des fléchettes empoisonnées.',
        requirements: {
            proficiency: ['martial']
        },
        maxRange: 20, // 100 pieds max
        twoHanded: false,
        ammunitionType: 'needle'
    },

    'hand_crossbow': {
        id: 'hand_crossbow',
        name: 'Arbalète de poing',
        type: 'martial',
        category: 'ranged',
        damageDice: '1d6',
        damageType: 'piercing',
        range: { min: 2, max: 6 }, // 30 pieds = 6 cases
        properties: ['ammunition', 'light', 'loading'],
        weight: 3,
        value: 75,
        rarity: 'common',
        description: 'Une arbalète miniature.',
        requirements: {
            proficiency: ['martial']
        },
        maxRange: 24, // 120 pieds max
        twoHanded: false,
        ammunitionType: 'crossbow_bolt'
    },

    'heavy_crossbow': {
        id: 'heavy_crossbow',
        name: 'Arbalète lourde',
        type: 'martial',
        category: 'ranged',
        damageDice: '1d10',
        damageType: 'piercing',
        range: { min: 2, max: 20 }, // 100 pieds = 20 cases
        properties: ['ammunition', 'heavy', 'loading', 'two_handed'],
        weight: 18,
        value: 50,
        rarity: 'common',
        description: 'Une puissante arbalète de siège.',
        requirements: {
            proficiency: ['martial']
        },
        maxRange: 80, // 400 pieds max = 80 cases
        twoHanded: true,
        ammunitionType: 'crossbow_bolt'
    },

    'longbow': {
        id: 'longbow',
        name: 'Arc long',
        type: 'martial',
        category: 'ranged',
        damageDice: '1d8',
        damageType: 'piercing',
        range: { min: 2, max: 30 }, // 150 pieds = 30 cases
        properties: ['ammunition', 'heavy', 'two_handed'],
        weight: 2,
        value: 50,
        rarity: 'common',
        description: 'Un arc de guerre traditionnel.',
        requirements: {
            proficiency: ['martial']
        },
        maxRange: 120, // 600 pieds max = 120 cases
        twoHanded: true,
        ammunitionType: 'arrow'
    },

    'net': {
        id: 'net',
        name: 'Filet',
        type: 'martial',
        category: 'ranged',
        damageDice: '0',
        damageType: 'none',
        range: { min: 1, max: 1 }, // 5 pieds
        properties: ['special', 'thrown'],
        weight: 3,
        value: 1,
        rarity: 'common',
        description: 'Un filet pour entraver les ennemis.',
        requirements: {
            proficiency: ['martial']
        },
        maxRange: 3, // 15 pieds max
        specialRules: ['Entrave la cible, aucun dégât'],
        twoHanded: false
    },

    // === ARMES SPÉCIALES/MAGIQUES ===

    'flame_tongue': {
        id: 'flame_tongue',
        name: 'Lame de Feu',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['versatile', 'magical'],
        weight: 3,
        value: 1000,
        rarity: 'rare',
        description: 'Une épée magique qui s\'enflamme au combat.',
        requirements: {
            proficiency: ['martial'],
            attunement: true
        },
        versatileDamage: '1d10',
        bonusDamage: '2d6',
        bonusDamageType: 'fire',
        twoHanded: false,
        magicalProperties: ['flame_activation']
    },

    'frost_brand': {
        id: 'frost_brand',
        name: 'Marque de Givre',
        type: 'martial',
        category: 'melee',
        damageDice: '1d8',
        damageType: 'slashing',
        range: { min: 1, max: 1 },
        properties: ['versatile', 'magical'],
        weight: 3,
        value: 1200,
        rarity: 'very_rare',
        description: 'Une épée glacée qui résiste au feu.',
        requirements: {
            proficiency: ['martial'],
            attunement: true
        },
        versatileDamage: '1d10',
        bonusDamage: '1d6',
        bonusDamageType: 'cold',
        twoHanded: false,
        magicalProperties: ['fire_resistance', 'frost_activation']
    },

    // === ARMES IMPROVISÉES ===

    'unarmed': {
        id: 'unarmed',
        name: 'Combat à mains nues',
        type: 'simple',
        category: 'melee',
        damageDice: '1',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: ['nonlethal'],
        weight: 0,
        value: 0,
        rarity: 'common',
        description: 'Combat avec les poings.',
        requirements: {},
        twoHanded: false
    },

    'improvised': {
        id: 'improvised',
        name: 'Arme improvisée',
        type: 'simple',
        category: 'melee',
        damageDice: '1d4',
        damageType: 'bludgeoning',
        range: { min: 1, max: 1 },
        properties: [],
        weight: 2,
        value: 0,
        rarity: 'common',
        description: 'N\'importe quel objet utilisé comme arme.',
        requirements: {},
        twoHanded: false
    }
};

// Fonctions utilitaires pour la base de données
export const getWeaponById = (id: string): Weapon | null => {
    return WEAPON_DATABASE[id] || null;
};

export const getWeaponsByType = (type: 'simple' | 'martial'): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => weapon.type === type);
};

export const getWeaponsByCategory = (category: 'melee' | 'ranged'): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => weapon.category === category);
};

export const getWeaponsByRarity = (rarity: string): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => weapon.rarity === rarity);
};

export const getMeleeWeapons = (): Weapon[] => {
    return getWeaponsByCategory('melee');
};

export const getRangedWeapons = (): Weapon[] => {
    return getWeaponsByCategory('ranged');
};

export const getTwoHandedWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => weapon.twoHanded === true);
};

export const getLightWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => 
        weapon.properties?.includes('light')
    );
};

export const getFinesseeWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => 
        weapon.properties?.includes('finesse')
    );
};

export const getReachWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => 
        weapon.properties?.includes('reach')
    );
};

export const getThrownWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => 
        weapon.properties?.includes('thrown')
    );
};

export const getMagicalWeapons = (): Weapon[] => {
    return Object.values(WEAPON_DATABASE).filter(weapon => 
        weapon.properties?.includes('magical')
    );
};

// Calculateur de dégâts moyens
export const getAverageDamage = (weapon: Weapon): number => {
    const baseDamage = calculateDiceAverage(weapon.damageDice);
    const bonusDamage = weapon.magicalBonus || 0;
    return baseDamage + bonusDamage;
};

// Fonction pour calculer la moyenne d'un dé (ex: "1d8" = 4.5)
function calculateDiceAverage(diceString: string): number {
    const match = diceString.match(/(\d+)d(\d+)/);
    if (!match) {
        return parseFloat(diceString) || 0; // Pour les dégâts fixes comme "1"
    }
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    return count * ((sides + 1) / 2);
}

// Export par défaut pour faciliter l'importation
export default WEAPON_DATABASE;