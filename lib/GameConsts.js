const GameConsts = {
  // Server Settings
  MAX_ROOM_SIZE: 8,
  RESPAWN_TIME_SECONDS: 5,
  ROUND_LENGTH_MINUTES: 5,
  END_OF_ROUND_BREAK_SECONDS: 10,
  PLAYER_FULL_HEALTH: 100,
  MAPS: ['PunkFallout', 'HighRuleJungle', 'PunkCity', 'PunkLoop', 'DeathCycle', 'EvilUnderground'],
  GAMEMODES: [
    'Deathmatch',
    'TeamDeathmatch',
  ],
  TICK_RATE: 1000 / 20,

  ENABLE_NETWORK_STATS: false,
  ENABLE_NETWORK_EVENT_LOGS: false,

  EVENTS: [
    // server -> client
    'ANNOUNCEMENT',
    'LOAD_GAME',
    'MESSAGE_RECEIVED',
    'PLAYER_HEALTH_UPDATE',
    'PLAYER_KILL_LOG',
    'UPDATE_PLAYER_SCORES',

    // server <-> client
    'BULLET_FIRED',
    // 'KICK_PLAYER', // not emitted from client
    'PLAYER_DAMAGED',
    'PLAYER_RESPAWN',
    'REFRESH_ROOM',

    // client -> server
    'MESSAGE_SEND',
    'MOVE_PLAYER',
    'NEW_PLAYER',
    'REQUEST_PLAYER_SCORES',
    'PLAYER_FULL_HEALTH',
    'PLAYER_HEALING',
    'PLAYER_UPDATE_NICKNAME',
  ],

  // Client Settings
  DEBUG: false,
  PHASER_DEBUG: false,
  STARTING_SFX_VOLUME: .04,
  MAX_IDLE_SECONDS: 60,
  MAX_CHAT_MESSAGE_LENGTH: 100,
  MAX_NICKNAME_LENGTH: 25,
  SCALING: {
    SCALE_FACTOR: 1600,
    UPPER_HEIGHT_SCALE_FACTOR_LIMIT: 1600,
    STATIC_WIDTH_SCALE_FACTOR: 1600,
    STATIC_HEIGHT_SCALE_FACTOR: 1000,
  },

  // Spawn Point
  SPAWN_POINT_DISTANCE_FROM_ENEMY: 900,

  // Jump Jet
  JUMP_JET_SPEED: -1500,
  JUMP_JET_SPEED_REGENERATION: -1400,
  JUMP_JET_STARTING_FUEL: -190000,
  JUMP_JET_DEAD_ZONE_FUEL: -185000,

  // Player Model
  ANIMATION_FRAMERATE: 10,
  STANDING_RIGHT_FRAME: 6,
  STANDING_LEFT_FRAME: 13,
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
    RIGHT_JUMP_JET_Y: -1,
  },

  PLAYER_FACE: {
    LEFT: {
      RIGHT_ARM_X: 6,
      RIGHT_ARM_Y: -14,

      LEFT_ARM_X: -5,
      LEFT_ARM_Y: -14,
    },
    RIGHT: {
      RIGHT_ARM_X: -6,
      RIGHT_ARM_Y: -14,

      LEFT_ARM_X: 5,
      LEFT_ARM_Y: -14,
    },
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
    snapUp: 0,
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
    34: 'HALF_LEFT',
  },

  PRIMARY_WEAPON_IDS: ['AK47', 'M4A1', 'P90', 'M500', 'Barrett'],
  SECONDARY_WEAPON_IDS: ['DesertEagle', 'Skorpion', 'RPG'],

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
      frame: 6,
      shootingFrame: 14,
      position: {
        rotation: 80.20,
        scale: 0.65,
        muzzleFlashX: 12,
        muzzleFlashY: -49,
      },
    },
    M500: {
      ammo: 6,
      bulletSpeed: 2500,
      bulletType: 'shotgun',
      damage: 16,
      fireRate: 1000,
      frame: 1,
      id: 'M500',
      image: 'Spr_M500.png',
      name: 'M500',
      reloadTime: 3000,
      shootingFrame: 9,
      position: {
        rotation: 80.20,
        scale: 0.46,
        muzzleFlashX: 122,
        muzzleFlashY: 0,
      },
    },
    Skorpion: {
      ammo: 10,
      bulletSpeed: 2500,
      damage: 10,
      fireRate: 80,
      frame: 4,
      id: 'Skorpion',
      image: 'Spr_Skorpion.png',
      name: 'Skorpion',
      reloadTime: 2000,
      shootingFrame: 12,
      position: {
        rotation: 80.20,
        scale: 0.3,
        muzzleFlashX: 35,
        muzzleFlashY: -75,
      },
    },
    P90: {
      ammo: 50,
      bulletSpeed: 2500,
      damage: 12,
      fireRate: 120,
      frame: 2,
      id: 'P90',
      image: 'Spr_p90.png',
      name: 'P90',
      reloadTime: 2400,
      shootingFrame: 10,
      position: {
        rotation: 80.20,
        scale: 0.4,
        muzzleFlashX: 71,
        muzzleFlashY: -58,
      },
    },
    M4A1: {
      ammo: 30,
      bulletSpeed: 2500,
      damage: 14,
      fireRate: 140,
      frame: 3,
      id: 'M4A1',
      image: 'Spr_M4A1.png',
      name: 'M4A1',
      reloadTime: 2000,
      shootingFrame: 11,
      position: {
        rotation: 80.18,
        scale: 0.45,
        muzzleFlashX: 100,
        muzzleFlashY: -65,
      },
    },
    Barrett: {
      ammo: 10,
      bulletSpeed: 3000,
      damage: 80,
      fireRate: 2000,
      frame: 7,
      id: 'Barrett',
      image: 'Spr_Barrett.png',
      name: 'Barrett',
      reloadTime: 4000,
      shootingFrame: 15,
      position: {
        rotation: 80.20,
        scale: 0.4,
        muzzleFlashX: 165,
        muzzleFlashY: -65,
      },
    },
    DesertEagle: {
      ammo: 9,
      bulletSpeed: 2400,
      damage: 28,
      fireRate: 267,
      frame: 5,
      id: 'DesertEagle',
      image: 'Spr_DesertEagle.png',
      name: 'Desert Eagle',
      reloadTime: 2000,
      shootingFrame: 13,
      position: {
        rotation: 80.15,
        scale: 0.5,
        muzzleFlashX: 19,
        muzzleFlashY: -16,
      },
    },
    RPG: {
      ammo: 1,
      bulletSpeed: 2100,
      bulletType: 'rocket',
      damage: 100,
      fireRate: 1000,
      frame: 0,
      id: 'RPG',
      image: 'Spr_RPG.png',
      name: 'RPG',
      reloadTime: 15000,
      shootingFrame: 8,
      switchDelay: 1000,
      position: {
        rotation: 80.20,
        scale: 0.4,
        muzzleFlashX: 172,
        muzzleFlashY: -72,
      },
    },
  },
}

GameConsts.EVENT = {}
GameConsts.EVENTS.forEach(function(eventName, index) {
  GameConsts.EVENT[eventName] = index
})

if (process.env.NODE_ENV !== 'production') {
  Object.assign(GameConsts, require('./GameConsts.dev'))
}

module.exports = GameConsts
