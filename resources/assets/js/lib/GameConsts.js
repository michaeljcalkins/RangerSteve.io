const GameConsts = {
    DEBUG: false,
    STARTING_SFX_VOLUME: .1,
    STARTING_MUSIC_VOLUME: .2,

    // Physics
    MAX_VELOCITY_X: 650,
    MAX_VELOCITY_Y: 1600, // Max velocity before player starts going through the ground.
    ACCELERATION: 1200,
    DRAG: 3000,
    GRAVITY: 1000,
    JUMP_SPEED: -450,
    BULLET_GRAVITY: -850,

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
    },

    PRIMARY_WEAPON_IDS: ['AK47', 'G43', 'M500', 'AUG', 'Skorpion', 'P90', 'M4A1', 'Barrett'],
    SECONDARY_WEAPON_IDS: ['DesertEagle', 'SilverBaller', 'RPG'],

    // Weapons
    WEAPONS: {
        AK47: {
            ammo: 30,
            damage: 22,
            fireRate: 140,
            id: 'AK47',
            image: '/images/guns/Spr_AK47.png',
            name: 'AK-47',
            reloadTime: 2000,
            bulletSpeed: 2300,
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
            ammo: 10,
            reloadTime: 2000,
            bulletSpeed: 2500,
            damage: 55,
            fireRate: 700,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: -14,
                leftFaceY: 63,

                rightFaceX: -4,
                rightFaceY: 40,

                muzzleFlashX: 132,
                muzzleFlashY: -72
            }
        },
        M500: {
            id: 'M500',
            name: 'M500',
            image: '/images/guns/Spr_M500.png',
            bulletType: 'shotgun',
            ammo: 6,
            reloadTime: 3000,
            bulletSpeed: 2300,
            damage: 25,
            fireRate: 1400,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: -19,
                leftFaceY: 34,

                rightFaceX: 1,
                rightFaceY: 24,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        AUG: {
            id: 'AUG',
            name: 'AUG',
            image: '/images/guns/Spr_Aug.png',
            ammo: 30,
            reloadTime: 2000,
            damage: 18,
            fireRate: 140,
            bulletSpeed: 2300,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        Skorpion: {
            id: 'Skorpion',
            name: 'Skorpion',
            image: '/images/guns/Spr_Skorpion.png',
            ammo: 20,
            reloadTime: 2000,
            bulletSpeed: 2300,
            damage: 20,
            fireRate: 100,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        P90: {
            id: 'P90',
            name: 'P90',
            image: '/images/guns/Spr_p90.png',
            ammo: 50,
            reloadTime: 2000,
            bulletSpeed: 2300,
            damage: 17,
            fireRate: 120,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        M4A1: {
            id: 'M4A1',
            name: 'M4A1',
            image: '/images/guns/Spr_M4A1.png',
            ammo: 30,
            reloadTime: 2000,
            bulletSpeed: 2400,
            damage: 19,
            fireRate: 130,
            position: {
                rotation: 80.06,
                scale: 1.4,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        Barrett: {
            id: 'Barrett',
            name: 'Barrett',
            image: '/images/guns/Spr_Barrett.png',
            ammo: 10,
            reloadTime: 3000,
            bulletSpeed: 3435,
            damage: 88,
            fireRate: 3000,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        DesertEagle: {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: '/images/guns/Spr_DesertEagle.png',
            ammo: 9,
            reloadTime: 2000,
            bulletSpeed: 2300,
            damage: 36,
            fireRate: 267,
            position: {
                rotation: 80.15,
                scale: 1.3,

                leftFaceX: -12,
                leftFaceY: -20,

                rightFaceX: 9,
                rightFaceY: -29,

                muzzleFlashX: 5,
                muzzleFlashY: -75
            }
        },
        SilverBaller: {
            id: 'SilverBaller',
            name: 'Silenced Beretta',
            image: '/images/guns/Spr_SilverBaller.png',
            ammo: 15,
            reloadTime: 2000,
            bulletSpeed: 2300,
            damage: 38,
            fireRate: 250,
            position: {
                rotation: 80.15,
                scale: 1.4,

                leftFaceX: -12,
                leftFaceY: -20,

                rightFaceX: 9,
                rightFaceY: -29,

                muzzleFlashX: 35,
                muzzleFlashY: -80
            }
        },
        RPG: {
            id: 'RPG',
            name: 'RPG',
            image: '/images/guns/Spr_RPG.png',
            ammo: 1,
            bulletType: 'rocket',
            reloadTime: 500000,
            bulletSpeed: 2100,
            damage: 100,
            fireRate: 1000,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: 33,
                leftFaceY: 90,

                rightFaceX: -50,
                rightFaceY: 90,

                muzzleFlashX: 172,
                muzzleFlashY: -72
            }
        }
    }
}

export default GameConsts
