const GameConsts = {
    DEBUG: false,
    STARTING_SFX_VOLUME: .1,
    STARTING_MUSIC_VOLUME: .2,

    // Jump Jet
    JUMP_JET_SPEED: -1500,
    JUMP_JET_SPEED_REGENERATION: -1400,
    JUMP_JET_STARTING_FUEL: -190000,
    JUMP_JET_DEAD_ZONE_FUEL: -185000,

    // Player Model
    ANIMATION_LEFT: _.range(23, 28, 1),
    ANIMATION_RIGHT: _.range(30, 35, 1),
    ANIMATION_DEATH: _.range(0, 21, 1),
    ANIMATION_FRAMERATE: 10,
    STANDING_LEFT_FRAME: 28,
    STANDING_RIGHT_FRAME: 35,
    STARTING_PRIMARY_ID: 'AK47',
    STARTING_SECONDARY_ID: 'DesertEagle',
    PLAYER_ANCHOR: 1,
    PLAYER_SPRITE_WIDTH: 38,
    PLAYER_SPRITE_HEIGHT: 40,
    PLAYER_BODY_WIDTH: 105,
    PLAYER_BODY_HEIGHT: 280,

    // Physics
    MAX_VELOCITY_X: 500,
    MAX_VELOCITY_Y: 1100, // Max velocity before player starts going through the ground.
    BULLET_GRAVITY: -950,

    // Slope Plugin
    SLOPE_FEATURES: {
        acceleration: 1500,
        bounceX: 0,
        bounceY: 0,
        debug: 0,
        dragX: 900,
        dragY: 0,
        enableGravity: true,
        frictionX: 0,
        frictionY: 0,
        gravity: 1000,
        jump: 450,
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
            image: 'Spr_AK47.png',
            name: 'AK-47',
            reloadTime: 2000,
            bulletSpeed: 2500,
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
            image: 'Spr_g43.png',
            ammo: 10,
            reloadTime: 2000,
            bulletSpeed: 2500,
            damage: 55,
            fireRate: 700,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: -14,
                leftFaceY: 61,

                rightFaceX: -5,
                rightFaceY: 48,

                muzzleFlashX: 132,
                muzzleFlashY: -72
            }
        },
        M500: {
            id: 'M500',
            name: 'M500',
            image: 'Spr_M500.png',
            bulletType: 'shotgun',
            ammo: 6,
            reloadTime: 3000,
            bulletSpeed: 2500,
            damage: 22,
            fireRate: 1300,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: -13,
                leftFaceY: 34,

                rightFaceX: 8,
                rightFaceY: 24,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        AUG: {
            id: 'AUG',
            name: 'AUG',
            image: 'Spr_Aug.png',
            ammo: 30,
            reloadTime: 2000,
            damage: 15,
            fireRate: 140,
            bulletSpeed: 2500,
            position: {
                rotation: 80.20,
                scale: 1.3,

                leftFaceX: 0,
                leftFaceY: 48,

                rightFaceX: -14,
                rightFaceY: 34,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        Skorpion: {
            id: 'Skorpion',
            name: 'Skorpion',
            image: 'Spr_Skorpion.png',
            ammo: 20,
            reloadTime: 2000,
            bulletSpeed: 2500,
            damage: 14,
            fireRate: 100,
            position: {
                rotation: 80.20,
                scale: 1.2,

                leftFaceX: -7,
                leftFaceY: -20,

                rightFaceX: -7,
                rightFaceY: -30,

                muzzleFlashX: 35,
                muzzleFlashY: -75
            }
        },
        P90: {
            id: 'P90',
            name: 'P90',
            image: 'Spr_p90.png',
            ammo: 50,
            reloadTime: 2000,
            bulletSpeed: 2500,
            damage: 17,
            fireRate: 120,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: -7,
                leftFaceY: 30,

                rightFaceX: -7,
                rightFaceY: 19,

                muzzleFlashX: 71,
                muzzleFlashY: -58
            }
        },
        M4A1: {
            id: 'M4A1',
            name: 'M4A1',
            image: 'Spr_M4A1.png',
            ammo: 30,
            reloadTime: 2000,
            bulletSpeed: 2600,
            damage: 19,
            fireRate: 120,
            position: {
                rotation: 80.18,
                scale: 1.45,

                leftFaceX: 10,
                leftFaceY: 40,

                rightFaceX: -10,
                rightFaceY: 40,

                muzzleFlashX: 102,
                muzzleFlashY: -72
            }
        },
        Barrett: {
            id: 'Barrett',
            name: 'Barrett',
            image: 'Spr_Barrett.png',
            ammo: 10,
            reloadTime: 3000,
            bulletSpeed: 3435,
            damage: 80,
            fireRate: 2000,
            position: {
                rotation: 80.20,
                scale: 1.4,

                leftFaceX: 7,
                leftFaceY: 35,

                rightFaceX: -18,
                rightFaceY: 17,

                muzzleFlashX: 162,
                muzzleFlashY: -72
            }
        },
        DesertEagle: {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: 'Spr_DesertEagle.png',
            ammo: 9,
            reloadTime: 2000,
            bulletSpeed: 2400,
            damage: 34,
            fireRate: 267,
            position: {
                rotation: 80.15,
                scale: 1.4,

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
            image: 'Spr_SilverBaller.png',
            ammo: 15,
            reloadTime: 2000,
            bulletSpeed: 2400,
            damage: 24,
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
            image: 'Spr_RPG.png',
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
