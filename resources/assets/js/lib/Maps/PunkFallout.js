import GameConsts from '../GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 3600
const WORLD_HEIGHT = 2280

const SPAWN_POINTS = [
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
    { x: 800, y: 1950 },
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/punk-fallout/background.png', true)
    this.load.tilemap('tilemap', '/maps/punk-fallout/punk-fallout.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('ninja-tiles24', '/images/ninja-tiles24.png', 24, 24);
}

export function createOverlays() {
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

    // Add the demo tilemap and attach a tilesheet for its collision layer
    this.map = this.add.tilemap('tilemap')
    this.map.addTilesetImage('collision', 'ninja-tiles24')

    // Create a TilemapLayer object from the collision layer of the map
    this.ground = this.map.createLayer('collision')
    this.ground.renderSettings.enableScrollDelta = false
    if (! GameConsts.DEBUG) this.ground.alpha = 0

    // Map Arcade Slopes tile types to Ninja Physics debug tilesheets,
    // preparing slope data for each of tile in the layer
    this.game.slopes.convertTilemapLayer(this.ground, GameConsts.SLOPE_TILES)

    // Enable collision between tile indexes 2 and 34
    this.map.setCollisionBetween(2, 34, true, 'collision')

    if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, SPAWN_POINTS)
}

export function update() {
}
