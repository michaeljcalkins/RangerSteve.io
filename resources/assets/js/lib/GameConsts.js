const GameConsts = {
    DEBUG: false,
    STARTING_SFX_VOLUME: .1,
    STARTING_MUSIC_VOLUME: .2,

    // Physics
    MAX_VELOCITY_X: 650,
    MAX_VELOCITY_Y: 1800,
    ACCELERATION: 1200,
    DRAG: 3000,
    GRAVITY: 1000,
    JUMP_SPEED: -550,
    BULLET_GRAVITY: -950,

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
    PLAYER_SPRITE_WIDTH: 71,
    PLAYER_SPRITE_HEIGHT: 68,
    PLAYER_BODY_WIDTH: 105,
    PLAYER_BODY_HEIGHT: 280,
    PLAYER_SLOPE_FRICTION_X: 2000,
    PLAYER_SLOPE_FRICTION_Y: 2200,

    // Weapons
    PRIMARY_WEAPONS: {
        AK47: {
            id: 'AK47',
            name: 'AK-47',
            image: '/images/guns/Spr_AK47.png',
            minScore: 0,
            ammo: 30,
            reloadTime: 2000,
            bullet: {
                fireRate: 140,
                height: 40,
                speed: 2300,
                width: 40,
                damage: 22
            },
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        G43: {
            id: 'G43',
            name: 'G43',
            image: '/images/guns/Spr_g43.png',
            minScore: 0,
            ammo: 10,
            reloadTime: 2000
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
            minScore: 10,
            ammo: 30,
            reloadTime: 2000
        },
        Skorpion: {
            id: 'Skorpion',
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png',
            minScore: 20,
            ammo: 20,
            reloadTime: 2000
        },
        P90: {
            id: 'P90',
            name: 'P90',
            image: '/images/guns/Spr_p90.png',
            minScore: 30,
            ammo: 50,
            reloadTime: 2000
        },
        M4A1: {
            id: 'M4A1',
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png',
            minScore: 40,
            ammo: 30,
            reloadTime: 2000
        },
        Barrett: {
            id: 'Barrett',
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png',
            minScore: 50,
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
            reloadTime: 2000
        },
        SilverBaller: {
            id: 'SilverBaller',
            name: 'Silenced Beretta',
            image: '/images/guns/Spr_SilverBaller.png',
            minScore: 20,
            ammo: 15,
            reloadTime: 2000
        },
        RPG: {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png',
            minScore: 30,
            ammo: 1,
            reloadTime: 500000
        }
    },

    // Slope Plugin
    SLOPE_FEATURES: {
        acceleration: 2000,
        bounceX: 0,
        bounceY: 0,
        debug: 0,
        dragX: 1200,
        dragY: 0,
        enableGravity: true,
        frictionX: 0,
        frictionY: 0,
        gravity: 1000,
        jump: 500,
        minimumOffsetY: 1,
        pullDown: 0,
        pullLeft: 0,
        pullRight: 0,
        pullUp: 0,
        snapDown: 0,
        snapLeft: 0,
        snapRight: 0,
        snapUp: 0
    },
    SLOPE_TILES: {
        2:  'FULL',
        3:  'HALF_BOTTOM_LEFT',
        4:  'HALF_BOTTOM_RIGHT',
        6:  'HALF_TOP_LEFT',
        5:  'HALF_TOP_RIGHT',
        15: 'QUARTER_BOTTOM_LEFT_LOW',
        16: 'QUARTER_BOTTOM_RIGHT_LOW',
        17: 'QUARTER_TOP_RIGHT_LOW',
        18: 'QUARTER_TOP_LEFT_LOW',
        19: 'QUARTER_BOTTOM_LEFT_HIGH',
        20: 'QUARTER_BOTTOM_RIGHT_HIGH',
        21: 'QUARTER_TOP_RIGHT_HIGH',
        22: 'QUARTER_TOP_LEFT_HIGH',
        23: 'QUARTER_LEFT_BOTTOM_HIGH',
        24: 'QUARTER_RIGHT_BOTTOM_HIGH',
        25: 'QUARTER_RIGHT_TOP_LOW',
        26: 'QUARTER_LEFT_TOP_LOW',
        27: 'QUARTER_LEFT_BOTTOM_LOW',
        28: 'QUARTER_RIGHT_BOTTOM_LOW',
        29: 'QUARTER_RIGHT_TOP_HIGH',
        30: 'QUARTER_LEFT_TOP_HIGH',
        31: 'HALF_BOTTOM',
        32: 'HALF_RIGHT',
        33: 'HALF_TOP',
        34: 'HALF_LEFT'
    }
}

export default GameConsts
