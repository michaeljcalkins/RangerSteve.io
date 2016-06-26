const GameConsts = {
    DEBUG: false,
    STARTING_SFX_VOLUME: .1,
    STARTING_MUSIC_VOLUME: .2,

    // Physics
    MAX_SPEED: 600,
    ACCELERATION: 1200,
    DRAG: 3000,
    GRAVITY: 1200,
    JUMP_SPEED: -550,
    JUMP_JET_SPEED: -1400,
    JUMP_JET_SPEED_REGENERATION: -1400,

    // Player Model
    ANIMATION_LEFT: _.range(0, 5, 1),
    ANIMATION_RIGHT: _.range(8, 13, 1),
    ANIMATION_DEATH: _.range(14, 35, 1),
    ANIMATION_FRAMERATE: 10,
    STARTING_PRIMARY_ID: 'AK47',
    STARTING_SECONDARY_ID: 'DesertEagle',
    PLAYER_SCALE: .27,
    PLAYER_ANCHOR: .5,
    PLAYER_SPRITE_WIDTH: 96,
    PLAYER_SPRITE_HEIGHT: 91,
    PLAYER_BODY_WIDTH: 145,
    PLAYER_BODY_HEIGHT: 295,
    PLAYER_SLOPE_FRICTION_X: 2000,
    PLAYER_SLOPE_FRICTION_Y: 2000,

    // Weapons
    PRIMARY_WEAPONS: [
        {
            id: 'AK47',
            name: 'AK-47',
            image: '/images/guns/Spr_AK47.png'
        },
        {
            id: 'M500',
            name: 'M500',
            image: '/images/guns/Spr_M500.png'
        },
        {
            id: 'Skorpion',
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png'
        },
        {
            id: 'AUG',
            name: 'AUG',
            image: '/images/guns/Spr_Aug.png'
        },
        {
            id: 'G43',
            name: 'G43',
            image: '/images/guns/Spr_g43.png'
        },
        {
            id: 'P90',
            name: 'P90',
            image: '/images/guns/Spr_p90.png'
        },
        {
            id: 'M4A1',
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png'
        },
        {
            id: 'Barrett',
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png'
        }
    ],

    SECONDARY_WEAPONS: [
        {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png'
        },
        {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png'
        },
        {
            id: 'SilverBaller',
            name: 'Silenced Beretta',
            image: '/images/guns/Spr_SilverBaller.png'
        }
    ]
}

export default GameConsts
