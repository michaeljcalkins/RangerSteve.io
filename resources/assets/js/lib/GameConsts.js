const GameConsts = {
    DEBUG: false,
    STARTING_SFX_VOLUME: .04,

    // Jump Jet
    JUMP_JET_SPEED: -1500,
    JUMP_JET_SPEED_REGENERATION: -1400,
    JUMP_JET_STARTING_FUEL: -190000,
    JUMP_JET_DEAD_ZONE_FUEL: -185000,

    // Player Model
    ANIMATION_FRAMERATE: 10,
    STANDING_LEFT_FRAME: 6,
    STANDING_RIGHT_FRAME: 13,
    STARTING_PRIMARY_ID: 'AK47',
    STARTING_SECONDARY_ID: 'DesertEagle',
    PLAYER_ANCHOR: 1,
    PLAYER_SPRITE_WIDTH: 35,
    PLAYER_SPRITE_HEIGHT: 35,
    PLAYER_BODY_WIDTH: 32,
    PLAYER_BODY_HEIGHT: 60,

    PLAYER_BODY: {
        LEFT_JUMP_JET_X: 25,
        LEFT_JUMP_JET_Y: -15,

        RIGHT_JUMP_JET_X: 25,
        RIGHT_JUMP_JET_Y: -1
    },

    PLAYER_FACE: {
        LEFT: {
            RIGHT_ARM_X: 6,
            RIGHT_ARM_Y: -14,

            LEFT_ARM_X: -5,
            LEFT_ARM_Y: -14
        },
        RIGHT: {
            RIGHT_ARM_X: -6,
            RIGHT_ARM_Y: -14,

            LEFT_ARM_X: 5,
            LEFT_ARM_Y: -14
        }
    },

    // Physics
    MAX_VELOCITY_X: 500,
    MAX_VELOCITY_Y: 1000, // Max velocity before player starts going through the ground.
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

    PRIMARY_WEAPON_IDS: ['AK47', 'M4A1', 'Skorpion', 'P90', 'M500', 'Barrett'],
    SECONDARY_WEAPON_IDS: ['DesertEagle', 'RPG'],

    // Weapons
    WEAPONS: {
        AK47: {
            ammo: 30,
            damage: 14,
            fireRate: 140,
            id: 'AK47',
            image: 'Spr_AK47.png',
            name: 'AK-47',
            reloadTime: 2000,
            bulletSpeed: 2500,
            frame: 17,
            shootingFrame: 37,
            position: {
                rotation: 80.20,
                scale: 0.65,
                muzzleFlashX: 12,
                muzzleFlashY: -49
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
            damage: 16,
            fireRate: 1300,
            shootingFrame: 22,
            frame: 2,
            position: {
                rotation: 80.20,
                scale: 0.46,
                muzzleFlashX: 122,
                muzzleFlashY: 0
            }
        },
        Skorpion: {
            id: 'Skorpion',
            name: 'Skorpion',
            image: 'Spr_Skorpion.png',
            ammo: 10,
            reloadTime: 2000,
            bulletSpeed: 2500,
            damage: 12,
            fireRate: 80,
            shootingFrame: 35,
            frame: 15,
            position: {
                rotation: 80.20,
                scale: 0.3,
                muzzleFlashX: 35,
                muzzleFlashY: -75
            }
        },
        P90: {
            id: 'P90',
            name: 'P90',
            image: 'Spr_p90.png',
            ammo: 50,
            reloadTime: 2400,
            bulletSpeed: 2500,
            damage: 13,
            fireRate: 120,
            shootingFrame: 29,
            frame: 9,
            position: {
                rotation: 80.20,
                scale: 0.4,
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
            damage: 17,
            fireRate: 120,
            shootingFrame: 30,
            frame: 10,
            position: {
                rotation: 80.18,
                scale: 0.45,
                muzzleFlashX: 100,
                muzzleFlashY: -65
            }
        },
        Barrett: {
            id: 'Barrett',
            name: 'Barrett',
            image: 'Spr_Barrett.png',
            ammo: 10,
            reloadTime: 4000,
            bulletSpeed: 3000,
            damage: 80,
            fireRate: 2000,
            shootingFrame: 39,
            frame: 19,
            position: {
                rotation: 80.20,
                scale: 0.4,
                muzzleFlashX: 165,
                muzzleFlashY: -65
            }
        },
        DesertEagle: {
            id: 'DesertEagle',
            name: 'Desert Eagle',
            image: 'Spr_DesertEagle.png',
            ammo: 9,
            reloadTime: 2000,
            bulletSpeed: 2400,
            damage: 28,
            fireRate: 267,
            shootingFrame: 36,
            frame: 16,
            position: {
                rotation: 80.15,
                scale: 0.5,
                muzzleFlashX: 19,
                muzzleFlashY: -16
            }
        },
        RPG: {
            id: 'RPG',
            name: 'RPG',
            image: 'Spr_RPG.png',
            ammo: 1,
            bulletType: 'rocket',
            reloadTime: 15000,
            bulletSpeed: 2100,
            damage: 100,
            fireRate: 1000,
            frame: 0,
            shootingFrame: 20,
            position: {
                rotation: 80.20,
                scale: 0.4,
                muzzleFlashX: 172,
                muzzleFlashY: -72
            }
        }
    }
}

window.GameConsts = GameConsts

export default GameConsts
