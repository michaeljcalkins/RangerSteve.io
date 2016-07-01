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

    // Jump Jet
    JUMP_JET_SPEED: -1500,
    JUMP_JET_SPEED_REGENERATION: -1400,
    JUMP_JET_STARTING_FUEL: -190000,
    JUMP_JET_DEAD_ZONE_FUEL: -185000,

    // Player Model
    ANIMATION_LEFT: _.range(0, 5, 1),
    ANIMATION_RIGHT: _.range(8, 13, 1),
    ANIMATION_DEATH: _.range(14, 35, 1),
    ANIMATION_FRAMERATE: 10,
    STARTING_PRIMARY_ID: 'AK47',
    STARTING_SECONDARY_ID: 'DesertEagle',
    PLAYER_SCALE: .27,
    PLAYER_ANCHOR: .5,
    PLAYER_SPRITE_WIDTH: 94,
    PLAYER_SPRITE_HEIGHT: 91,
    PLAYER_BODY_WIDTH: 105,
    PLAYER_BODY_HEIGHT: 280,
    PLAYER_SLOPE_FRICTION_X: 2000,
    PLAYER_SLOPE_FRICTION_Y: 2000,

    // Weapons
    PRIMARY_WEAPONS: {
        AK47: {
            id: 'AK47',
            name: 'AK-47',
            image: '/images/guns/Spr_AK47.png',
            minScore: 0,
            ammo: 30,
            reloadTime: 3000
        },
        G43: {
            id: 'G43',
            name: 'G43',
            image: '/images/guns/Spr_g43.png',
            minScore: 0,
            ammo: 10,
            reloadTime: 3000
        },
        M500: {
            id: 'M500',
            name: 'M500',
            image: '/images/guns/Spr_M500.png',
            minScore: 0,
            ammo: 6,
            reloadTime: 3000
        },
        AUG: {
            id: 'AUG',
            name: 'AUG',
            image: '/images/guns/Spr_Aug.png',
            minScore: 20,
            ammo: 30,
            reloadTime: 3000
        },
        Skorpion: {
            id: 'Skorpion',
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png',
            minScore: 20,
            ammo: 20,
            reloadTime: 3000
        },
        P90: {
            id: 'P90',
            name: 'P90',
            image: '/images/guns/Spr_p90.png',
            minScore: 40,
            ammo: 50,
            reloadTime: 3000
        },
        M4A1: {
            id: 'M4A1',
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png',
            minScore: 40,
            ammo: 30,
            reloadTime: 3000
        },
        Barrett: {
            id: 'Barrett',
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png',
            minScore: 60,
            ammo: 10,
            reloadTime: 3000
        }
    },

    SECONDARY_WEAPONS: {
        DesertEagle: {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png',
            minScore: 0,
            ammo: 9,
            reloadTime: 3000
        },
        SilverBaller: {
            id: 'SilverBaller',
            name: 'Silenced Beretta',
            image: '/images/guns/Spr_SilverBaller.png',
            minScore: 40,
            ammo: 15,
            reloadTime: 3000
        },
        RPG: {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png',
            minScore: 70,
            ammo: 1,
            reloadTime: 3000
        }
    }
}

export default GameConsts
