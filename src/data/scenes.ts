import type { Scene } from '../types/Scene';
import { CharacterClass } from '../types/Character';

export const scenes: Record<string, Scene> = {
    'tavern_start': {
        id: 'tavern_start',
        title: 'La Taverne du Dragon Endormi',
        type: 'TEXTUAL',
        description: 'Vous vous trouvez dans une taverne animée. L\'odeur de la bière et du ragoût emplit l\'air. Un homme encapuchonné dans le coin semble vouloir vous parler.',
        choices: [
            {
                id: 'talk_stranger',
                text: 'Approcher l\'homme encapuchonné',
                nextSceneId: 'stranger_quest',
                consequences: {
                    flags: { "met_stranger": true },
                    xp: 4000
                }
            },
            {
                id: 'order_drink',
                text: 'Commander une bière (5 or)',
                nextSceneId: 'tavern_drink',
                requirements: {
                    gold: 5
                },
                consequences: {
                    gold: -5,
                    heal: 2
                }
            },
            {
                id: 'go_outside',
                text: 'Sortir dehors',
                nextSceneId: 'outside_tavern'
            },
        ]
    },
    'stranger_quest': {
        id: 'stranger_quest',
        title: 'Le rodeur', type: 'TEXTUAL',
        description: 'L\'homme vous propose une quete',
        choices: [
            {
                id: 'accept_quest',
                text: 'Accepter la quete',
                nextSceneId: 'quest_accepted',
                consequences: {
                    flags: { "quest_accepted": true }
                }
            },
            {
                id: 'decline_quest',
                text: 'Refuser la quete',
                nextSceneId: 'quest_refused',
                consequences: {
                    flags: { "quest_refused": true }
                }
            },
            {
                id: 'charm_rogue',
                text: 'Lancer un sort sur le rodeur',
                nextSceneId: 'rogue_charmed',
                requirements: {
                    class: [CharacterClass.WIZARD]
                },
                consequences: {
                    flags: { "rogue_charmed": true }
                }
            }
        ]
    },
    'quest_accepted': {
        id: 'quest_accepted',
        title: 'La recherche du médaillon perdu', type: 'TEXTUAL',
        description: 'Vous vous mettez en route pour la cité d\'Elembor, vous y connaissez un archimage qui fut joailler pendant sa jeunnesse, peut etre a t il entendu parler du médaillon que vous recherchez',
        choices: [{
            id: 'forest',
            text: 'Passez par la forêt',
            nextSceneId: 'forest_entrance'
        }, {
            id: 'dark_road',
            text: 'Prendre le chemin sombre',
            nextSceneId: 'dark_road'
        }

        ]

    },
    'forest_entrance': {
        id: 'forest_entrance',
        type: 'COMBAT',
        title: 'Embuscade dans la forêt',
        description: 'Des gobelins surgissent des buissons ! Préparez-vous au combat !',
        combat: {
            enemy: [{ id: 'goblin', count: 2 }, { id: 'kobold', count: 1 }],
            gridSize: {
                width: 8,
                height: 6
            },
            initialPositions: [
                { x: 2, y: 2 }, { x: 6, y: 2 },
                { x: 1, y: 4 },
            ],

        },
        choices: [
            {
                id: 'continue_forest',
                text: 'Continuer dans la forêt',
                nextSceneId: 'deep_forest',
                consequences: {
                    flags: { "quest_accepted": true }
                }
            }
        ]

    },

    // === NOUVELLES SCÈNES POUR TESTER LES DIFFÉRENTS TYPES ===
    
    'tavern_drink': {
        id: 'tavern_drink',
        title: 'Une bière bien méritée',
        type: 'TEXTUAL',
        description: 'Vous sirotez votre bière en observant les autres clients de la taverne. La chaleur de l\'alcool vous réconforte et vos blessures semblent moins douloureuses.',
        choices: [
            {
                id: 'talk_to_barmaid',
                text: 'Parler à la serveuse',
                nextSceneId: 'barmaid_dialogue'
            },
            {
                id: 'listen_rumors',
                text: 'Écouter les rumeurs',
                nextSceneId: 'tavern_rumors'
            },
            {
                id: 'back_to_tavern',
                text: 'Retourner dans la taverne',
                nextSceneId: 'tavern_start'
            }
        ]
    },

    'barmaid_dialogue': {
        id: 'barmaid_dialogue',
        title: 'Conversation avec la serveuse',
        type: 'DIALOGUE',
        description: 'La serveuse s\'approche de vous avec un sourire chaleureux.',
        npc: {
            name: 'Elena la Serveuse',
            portrait: '', // URL vide = placeholder
            dialogue: 'Bonsoir voyageur ! Je vois que vous n\'êtes pas d\'ici. Puis-je vous aider à trouver quelque chose ? Peut-être avez-vous besoin d\'équipement ou de provisions pour la route ?'
        },
        choices: [
            {
                id: 'ask_about_equipment',
                text: 'Où puis-je acheter de l\'équipement ?',
                nextSceneId: 'merchant_direction',
                consequences: {
                    flags: { "knows_merchant": true }
                }
            },
            {
                id: 'ask_about_quests',
                text: 'Y a-t-il du travail dans les environs ?',
                nextSceneId: 'tavern_jobs',
                consequences: {
                    xp: 10
                }
            },
            {
                id: 'compliment',
                text: 'Vous avez une très belle taverne !',
                nextSceneId: 'barmaid_happy',
                consequences: {
                    flags: { "barmaid_likes_you": true }
                }
            },
            {
                id: 'goodbye',
                text: 'Merci, je dois y aller',
                nextSceneId: 'tavern_start'
            }
        ]
    },

    'merchant_direction': {
        id: 'merchant_direction',
        title: 'Directions vers le marchand',
        type: 'DIALOGUE',
        npc: {
            name: 'Elena la Serveuse',
            portrait: '',
            dialogue: 'Ah ! Vous devriez aller voir Thorek le Forgeron. Sa boutique se trouve juste en face de la taverne. Il a toujours du bon équipement, même si ses prix sont un peu élevés !'
        },
        choices: [
            {
                id: 'visit_merchant',
                text: 'Aller voir le marchand',
                nextSceneId: 'thorek_shop'
            },
            {
                id: 'ask_more',
                text: 'Qu\'est-ce qu\'il vend exactement ?',
                nextSceneId: 'merchant_inventory_info'
            },
            {
                id: 'back_dialogue',
                text: 'D\'accord, merci pour l\'info',
                nextSceneId: 'barmaid_dialogue'
            }
        ]
    },

    'thorek_shop': {
        id: 'thorek_shop',
        title: 'La Forge de Thorek',
        type: 'MERCHANT',
        description: 'Vous entrez dans la forge de Thorek. L\'air est chaud et lourd, rempli du bruit des marteaux et du rougeoiement des flammes. Des armes et armures de toutes sortes ornent les murs.',
        merchant: {
            name: 'Thorek le Forgeron',
            portrait: '',
            greeting: 'Bienvenue dans ma forge ! J\'ai les meilleures armes et armures de la région !'
        },
        inventory: [
            { itemId: 'sword_iron', quantity: 3, priceMultiplier: 1.0 },
            { itemId: 'sword_steel', quantity: 1, priceMultiplier: 1.2 },
            { itemId: 'armor_leather', quantity: 5, priceMultiplier: 0.9 },
            { itemId: 'shield_wooden', quantity: 4, priceMultiplier: 0.8 },
            { itemId: 'potion_health', quantity: 10, priceMultiplier: 1.1 },
            { itemId: 'potion_mana', quantity: 6, priceMultiplier: 1.1 }
        ],
        choices: [
            {
                id: 'leave_shop',
                text: 'Sortir de la boutique',
                nextSceneId: 'outside_tavern'
            },
            {
                id: 'ask_custom_work',
                text: 'Pouvez-vous faire du travail sur mesure ?',
                nextSceneId: 'thorek_custom',
                requirements: {
                    gold: 100
                }
            }
        ]
    },

    'outside_tavern': {
        id: 'outside_tavern',
        title: 'Devant la taverne',
        type: 'TEXTUAL',
        description: 'Vous vous trouvez devant La Taverne du Dragon Endormi. La rue principale de la ville s\'étend devant vous, bordée de boutiques et de maisons. Vous pouvez voir la forge de Thorek en face, et un chemin mène vers la sortie de la ville.',
        choices: [
            {
                id: 'enter_tavern',
                text: 'Retourner dans la taverne',
                nextSceneId: 'tavern_start'
            },
            {
                id: 'visit_forge',
                text: 'Visiter la forge',
                nextSceneId: 'thorek_shop'
            },
            {
                id: 'explore_town',
                text: 'Explorer la ville',
                nextSceneId: 'town_exploration'
            },
            {
                id: 'leave_town',
                text: 'Quitter la ville',
                nextSceneId: 'crossroads',
                requirements: {
                    flags: ["met_stranger"]
                }
            }
        ]
    },

    'crossroads': {
        id: 'crossroads',
        title: 'Le Carrefour',
        type: 'TEXTUAL',
        description: 'Vous arrivez à un carrefour où trois chemins se séparent. Un panneau en bois indique : "Nord - Forêt Sombre", "Est - Marais Maudits", "Ouest - Montagnes Bleues". Le soleil commence à se coucher.',
        choices: [
            {
                id: 'forest_path',
                text: 'Prendre le chemin de la forêt (Nord)',
                nextSceneId: 'forest_entrance'
            },
            {
                id: 'swamp_path',
                text: 'Se diriger vers les marais (Est)',
                nextSceneId: 'swamp_entrance',
                consequences: {
                    damage: 5
                }
            },
            {
                id: 'mountain_path',
                text: 'Monter vers les montagnes (Ouest)',
                nextSceneId: 'mountain_entrance',
                requirements: {
                    level: 2
                }
            },
            {
                id: 'return_town',
                text: 'Retourner en ville',
                nextSceneId: 'outside_tavern'
            }
        ]
    },

    // Scènes manquantes référencées
    'quest_refused': {
        id: 'quest_refused',
        title: 'Quête refusée',
        type: 'TEXTUAL',
        description: 'L\'homme encapuchonné hausse les épaules avec déception. "Comme vous voulez, voyageur. Mais sachez que cette opportunité ne se représentera peut-être pas."',
        choices: [
            {
                id: 'reconsider',
                text: 'Reconsidérer la quête',
                nextSceneId: 'stranger_quest'
            },
            {
                id: 'definitive_no',
                text: 'Partir définitivement',
                nextSceneId: 'tavern_start',
                consequences: {
                    flags: { "definitely_refused_quest": true }
                }
            }
        ]
    },

    'dark_road': {
        id: 'dark_road',
        title: 'Le Chemin Sombre',
        type: 'TEXTUAL',
        description: 'Vous empruntez un sentier ombragé qui serpente entre de hauts arbres. L\'atmosphère est inquiétante et vous entendez des bruits étranges dans les buissons.',
        choices: [
            {
                id: 'continue_carefully',
                text: 'Continuer prudemment',
                nextSceneId: 'ambush_avoided',
                consequences: {
                    xp: 50
                }
            },
            {
                id: 'rush_forward',
                text: 'Foncer vers l\'avant',
                nextSceneId: 'bandit_ambush'
            },
            {
                id: 'turn_back',
                text: 'Faire demi-tour',
                nextSceneId: 'crossroads'
            }
        ]
    },

    'deep_forest': {
        id: 'deep_forest',
        title: 'Au Cœur de la Forêt',
        type: 'TEXTUAL',
        description: 'Après votre victoire contre les gobelins, vous continuez plus profondément dans la forêt. Les arbres deviennent plus anciens et plus imposants.',
        choices: [
            {
                id: 'find_ruins',
                text: 'Chercher des ruines anciennes',
                nextSceneId: 'ancient_ruins',
                consequences: {
                    xp: 100
                }
            },
            {
                id: 'exit_forest',
                text: 'Sortir de la forêt',
                nextSceneId: 'forest_edge'
            }
        ]
    }
};