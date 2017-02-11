import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

const WORLD_WIDTH = 100 * 32
const WORLD_HEIGHT = 75 * 32

export function preload () {
  this.game.load.image('background', '/maps/punk-loop/background.png')
  this.game.load.tilemap('tilemap', '/maps/punk-loop/punk-loop.json', null, window.Phaser.Tilemap.TILED_JSON)
  this.game.load.spritesheet('tiles', '/maps/punk-loop/tiles.png', 24, 24)
  this.game.load.spritesheet('ninja-tiles32', '/images/ninja-tiles32.png', 24, 24)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  this.background = this.game.add.sprite(0, 0, 'background')
  this.background.scale.setTo(3.4)

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.PunkLoop)
}
