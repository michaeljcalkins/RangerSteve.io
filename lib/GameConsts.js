const MapSpawnPoints = require('./settings/MapSpawnPoints')

const GameConsts = {
  // Server Settings
  MAX_ROOM_SIZE: 12,
  MAX_IDLE_TIME_IN_MS: 30 * 1000,
  RESPAWN_TIME_IN_MS: 5 * 1000,
  ROUND_LENGTH_IN_MS: 5 * 1000 * 60,
  END_OF_ROUND_BREAK_IN_MS: 10 * 1000,
  PLAYER_FULL_HEALTH: 100,
  NO_DAMAGE_TIME_BUFFER_IN_MS: 3 * 1000,
  POINTMATCH_END_ROUND_ON_SCORE: 150,

  MAPS: [
    'DarkForest',
    'Eclipse',
    'EvilUnderground',
    'HighRuleJungle',
    'PunkFallout'
  ],
  MAP_SPAWN_POINTS: MapSpawnPoints,
  GAMEMODES: [
    'Deathmatch',
    'TeamDeathmatch',
    'Pointmatch'
  ],
  TICK_RATE: 10,

  PROPERTY_MAP: {
    'a': 'angle',
    'f': 'flying',
    'h': 'health',
    'n': 'nickname',
    's': 'shooting',
    'p': 'isProtected',
    'v': 'isVisibleAfterTime',
    'vx': 'velocityX',
    'vy': 'velocityY',
    't': 'team',
    'w': 'weaponId'
  },

  GAME_LOOP_PLAYER_PROPERTIES: [
    'a', // angle
    'f', // flying
    'h', // health
    'n', // nickname
    's', // shooting
    'p', // isProtected
    'v', // isVisibleAfterTime
    'vx', // velocityX
    'vy', // velocityY
    't', // team
    'w', // weaponId
    'x',
    'y'
  ],
  MOVE_PLAYER_PROPERTIES: [
    'angle',
    'flying',
    'shooting',
    'weaponId',
    'velocityX',
    'velocityY',
    'x',
    'y'
  ],

  ENABLE_SERVER_NETWORK_STATS_LOG: false,
  ENABLE_NETWORK_EVENT_LOGS: false,

  // These events will not effect a player's lastMessageTime
  IGNORED_EVENTS_FOR_IDLE_DETECTION: [
    'NTP_SYNC'
  ],
  EVENTS: [
    // server -> client
    'ANNOUNCEMENT',
    'LOAD_GAME',
    'MESSAGE_RECEIVED',
    'PLAYER_HEALTH_UPDATE',
    'PLAYER_KILL_LOG',
    'GAME_LOOP',
    'PLAYER_JOINED',
    'PLAYER_LEFT',

    // server <-> client
    'BULLET_FIRED',
    'NTP_SYNC',
    'PLAYER_DAMAGED',
    'PLAYER_RESPAWN',
    'PLAYER_SCORES',

    // client -> server
    'LOAD_COMPLETE',
    'MESSAGE_SEND',
    'MOVE_PLAYER',
    'NEW_PLAYER',
    'PLAYER_FULL_HEALTH',
    'PLAYER_HEALING'
  ],

  // Store Settings
  STORE_PAYMENTS_CONFIG: [
    { basePrice: '4.99', gold: 500, title: 'Pile of Gold' },
    { basePrice: '9.99', gold: 1200, title: 'Bag of Gold' },
    { basePrice: '19.99', gold: 2500, title: 'Sack of Gold' },
    { basePrice: '49.99', gold: 6500, title: 'Box of Gold' },
    { basePrice: '99.99', gold: 14000, title: 'Chest of Gold' }
  ],
  STORE_DISCOUNT: 20, // percent

  // Client Settings
  DEBUG: false,
  STARTING_SFX_VOLUME: 0.04,
  MAX_CHAT_MESSAGE_LENGTH: 100,
  MAX_NICKNAME_LENGTH: 25,
  MAX_POSITION_BUFFER_LENGTH: 20,

  // Resolutions and scaling
  MAX_OPTIMAL_GAME_RATIO: 0.5,
  OPTIMAL_RESOLUTION: {
    WIDTH: 1800,
    HEIGHT: 900
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
  BULLET_GRAVITY: -950,
  PLAYER_PHYSICS: {
    ACCELERATION: 1500,
    BOUNCE: 0,
    DRAG_X: 900,
    DRAG_Y: 0,
    FRICTION: 0,
    MAX_VELOCITY_X: 500,
    MAX_VELOCITY_Y: 1000,
    GRAVITY: 1000,
    JUMP: 450
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
        muzzleFlashY: -49
      }
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
        muzzleFlashY: 0
      }
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
        muzzleFlashY: -75
      }
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
        muzzleFlashY: -58
      }
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
        muzzleFlashY: -65
      }
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
      switchDelay: 500,
      position: {
        rotation: 80.20,
        scale: 0.4,
        muzzleFlashX: 165,
        muzzleFlashY: -65
      }
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
        muzzleFlashY: -16
      }
    },
    RPG: {
      ammo: 1,
      bulletSpeed: 2100,
      bulletType: 'rocket',
      damage: 100,
      fireRate: 5000,
      frame: 0,
      id: 'RPG',
      image: 'Spr_RPG.png',
      name: 'RPG',
      reloadTime: 5000,
      shootingFrame: 8,
      switchDelay: 1000,
      position: {
        rotation: 80.20,
        scale: 0.4,
        muzzleFlashX: 172,
        muzzleFlashY: -72
      }
    }
  }
}

GameConsts.TICK_INTERVAL_MS = 1000 / GameConsts.TICK_RATE

GameConsts.EVENT = {}
GameConsts.EVENTS.forEach(function (eventName, index) {
  GameConsts.EVENT[eventName] = index
})

var discountFactor = 100 / (100 - GameConsts.STORE_DISCOUNT)

GameConsts.STORE_PAYMENTS = {}
GameConsts.STORE_PAYMENTS_CONFIG.forEach(function (payment) {
  var price = payment.basePrice
  if (GameConsts.STORE_DISCOUNT > 0) {
    price = price / discountFactor
  }
  price = parseFloat(price).toFixed(2)
  GameConsts.STORE_PAYMENTS[price] = payment
})

if (process.env.NODE_ENV !== 'production') {
  Object.assign(GameConsts, require('./GameConsts.dev'))
}

module.exports = GameConsts
