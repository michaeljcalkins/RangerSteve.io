const GameConsts = {
    WORLD_WIDTH: 8000,
    WORLD_HEIGHT: 3966,
    STARTING_VOLUME: .5,

    // Physics
    MAX_SPEED: 600,
    ACCELERATION: 1960,
    DRAG: 1500,
    GRAVITY: 1900,
    JUMP_SPEED: -850,
    JUMP_JET_SPEED: -2400,
    JUMP_JET_SPEED_REGENERATION: -2400,

    // Player Model
    ANIMATION_LEFT: [0, 1, 2, 3, 4, 5],
    ANIMATION_RIGHT: [8, 9, 10, 11, 12, 13],
    ANIMATION_FRAMERATE: 10,
    PLAYER_SCALE: .27,
    PLAYER_ANCHOR: .5,

    // Weapons
    PRIMARY_WEAPONS: [
        {
            id: 'AK47',
            name: 'AK-47',
            image: '/images/guns/Spr_AK47.png',
            minScore: 0
        },
        {
            id: 'M500',
            name: 'M500',
            image: '/images/guns/Spr_M500.png',
            minScore: 0
            // minScore: 10
        },
        {
            id: 'Skorpion',
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png',
            minScore: 0
            // minScore: 20
        },
        {
            id: 'Aug',
            name: 'Aug',
            image: '/images/guns/Spr_Aug.png',
            minScore: 0
            // minScore: 30
        },
        {
            id: 'G43',
            name: 'G43',
            image: '/images/guns/Spr_g43.png',
            minScore: 0
            // minScore: 40
        },
        {
            id: 'P90',
            name: 'P90',
            image: '/images/guns/Spr_p90.png',
            minScore: 0
            // minScore: 30
        },
        {
            id: 'M4A1',
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png',
            minScore: 0
            // minScore: 10
        },
        {
            id: 'Barrett',
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png',
            minScore: 0
            // minScore: 70
        }
    ],

    SECONDARY_WEAPONS: [
        {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png',
            minScore: 0
        },
        {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png',
            minScore: 20
        }
    ]
}

export default GameConsts
