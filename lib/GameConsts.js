const GameConsts = {
  // Server Settings
  MAX_ROOM_SIZE: 8,
  RESPAWN_TIME_SECONDS: 5,
  ROUND_LENGTH_MINUTES: 5,
  END_OF_ROUND_BREAK_SECONDS: 10,
  PLAYER_FULL_HEALTH: 100,
  NO_DAMAGE_BEFORE_SECONDS: 5,
  MAPS: [
    'DarkForest',
    'DeathCycle',
    'EvilUnderground',
    'HighRuleJungle',
    'PunkFallout',
    'PunkLoop'
  ],
  MAP_SPAWN_POINTS: {
    DarkForest: [
      { x: 93, y: 176 },
      { x: 510, y: 456 },
      { x: 1031, y: 271 },
      { x: 1383, y: 282 },
      { x: 537, y: 1280 },
      { x: 712, y: 993 },
      { x: 1148, y: 760 },
      { x: 1676, y: 618 },
      { x: 1970, y: 235 },
      { x: 2473, y: 237 },
      { x: 1502, y: 1133 },
      { x: 2157, y: 948 },
      { x: 969, y: 1350 },
      { x: 1916, y: 631 },
      { x: 2591, y: 750 },
      { x: 3333, y: 998 },
      { x: 3105, y: 308 },
      { x: 2837, y: 1290 },
      { x: 2479, y: 1323 },
      { x: 1970, y: 1114 },
      { x: 2189, y: 220 }
    ],
    DeathCycle: [
      { x: 797, y: 2253 },
      { x: 1595, y: 1641 },
      { x: 872, y: 1580 },
      { x: 2261, y: 2350 },
      { x: 2016, y: 2003 },
      { x: 2696, y: 1550 },
      { x: 2333, y: 1107 },
      { x: 1853, y: 1071 },
      { x: 998, y: 1167 },
      { x: 1078, y: 585 },
      { x: 501, y: 1555 },
      { x: 1730, y: 251 },
      { x: 2342, y: 616 },
      { x: 3019, y: 1461 },
      { x: 2957, y: 2359 }
    ],
    EvilUnderground: [
      { x: 1140, y: 2190 },
      { x: 1615, y: 1735 },
      { x: 2070, y: 2185 },
      { x: 770, y: 1515 },
      { x: 1697, y: 1263 },
      { x: 1535, y: 1260 },
      { x: 460, y: 1610 },
      { x: 140, y: 1320 },
      { x: 795, y: 1325 },
      { x: 440, y: 330 },
      { x: 65, y: 620 },
      { x: 2440, y: 1520 },
      { x: 2420, y: 1325 },
      { x: 2765, y: 1615 },
      { x: 3085, y: 1315 },
      { x: 2760, y: 335 },
      { x: 3040, y: 900 },
      { x: 1590, y: 490 },
      { x: 3155, y: 620 },
      { x: 1624, y: 913 },
      { x: 154, y: 908 },
      { x: 2562, y: 715 },
      { x: 666, y: 716 }
    ],
    HighRuleJungle: [
      { x: 2900, y: 2500 },
      { x: 2300, y: 2260 },
      { x: 1500, y: 2140 },
      { x: 2600, y: 1850 },
      { x: 2900, y: 1700 },
      { x: 3100, y: 1420 },
      { x: 3730, y: 1420 },
      { x: 3330, y: 1120 },
      { x: 2300, y: 1150 },
      { x: 1420, y: 1640 },
      { x: 1650, y: 1460 },
      { x: 4350, y: 1090 },
      { x: 1000, y: 1270 },
      { x: 1500, y: 1220 },
      { x: 400, y: 1270 },
      { x: 5100, y: 800 },
      { x: 5100, y: 1110 },
      { x: 5500, y: 1400 },
      { x: 4900, y: 1420 },
      { x: 2290, y: 730 }
    ],
    PunkFallout: [
      { x: 1150, y: 820 },
      { x: 1160, y: 1120 },
      { x: 1270, y: 1670 },
      { x: 2300, y: 1000 },
      { x: 1850, y: 1200 },
      { x: 1580, y: 1210 },
      { x: 1900, y: 1745 },
      { x: 2630, y: 1725 },
      { x: 2150, y: 310 },
      { x: 3200, y: 1000 },
      { x: 2800, y: 2130 },
      { x: 3350, y: 1715 },
      { x: 630, y: 1100 },
      { x: 600, y: 820 },
      { x: 900, y: 520 },
      { x: 800, y: 1950 }
    ],
    PunkLoop: [
      { x: 600, y: 380 },
      { x: 2760, y: 1030 },
      { x: 1850, y: 160 },
      { x: 1310, y: 160 },
      { x: 2440, y: 390 },
      { x: 1530, y: 585 },
      { x: 425, y: 110 },
      { x: 650, y: 2080 },
      { x: 1230, y: 2080 },
      { x: 1770, y: 2080 },
      { x: 2300, y: 2080 },
      { x: 2730, y: 2080 },
      { x: 2380, y: 1640 },
      { x: 1360, y: 1750 },
      { x: 1700, y: 1750 },
      { x: 1600, y: 1030 },
      { x: 660, y: 1640 },
      { x: 2730, y: 110 }
    ]
  },
  GAMEMODES: [
    'Deathmatch',
    'TeamDeathmatch'
  ],
  TICK_RATE: 1000 / 15,

  USE_WEBGL_BY_DEFAULT: false,

  GAME_LOOP_PLAYER_PROPERTIES: [
    'angle',
    'flying',
    'health',
    'nickname',
    'shooting',
    'team',
    'weaponId',
    'x',
    'y'
  ],
  MOVE_PLAYER_PROPERTIES: [
    'angle',
    'flying',
    'shooting',
    'weaponId',
    'x',
    'y'
  ],

  ENABLE_SERVER_NETWORK_STATS_LOG: true,
  ENABLE_NETWORK_EVENT_LOGS: true,

  EVENTS: [
    // server -> client
    'ANNOUNCEMENT',
    'LOAD_GAME',
    'MESSAGE_RECEIVED',
    'PLAYER_HEALTH_UPDATE',
    'PLAYER_KILL_LOG',
    'GAME_LOOP',

    // server <-> client
    'BULLET_FIRED',
    'PLAYER_DAMAGED',
    'PLAYER_RESPAWN',
    'REFRESH_ROOM',
    'PLAYER_SCORES',

    // client -> server
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
  PHASER_DEBUG: false,
  STARTING_SFX_VOLUME: 0.04,
  MAX_IDLE_SECONDS: 30,
  MAX_CHAT_MESSAGE_LENGTH: 100,
  MAX_NICKNAME_LENGTH: 25,
  SCALING: {
    SCALE_FACTOR: 1800,
    UPPER_HEIGHT_SCALE_FACTOR_LIMIT: 1600,
    STATIC_WIDTH_SCALE_FACTOR: 1800,
    STATIC_HEIGHT_SCALE_FACTOR: 1000
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
    2: 'FULL',
    3: 'HALF_BOTTOM_LEFT',
    4: 'HALF_BOTTOM_RIGHT',
    6: 'HALF_TOP_LEFT',
    5: 'HALF_TOP_RIGHT',
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
