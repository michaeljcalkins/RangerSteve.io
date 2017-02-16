import GameConsts from 'lib/GameConsts'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'
import collisions from './collisions'

const WORLD_WIDTH = 3600
const WORLD_HEIGHT = 2280

export function preload () {
  this.game.load.image('background', '/maps/punk-fallout/background.png', true)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  window.RS.groundPolygons = this.game.add.group()
  this.game.arcadePolygons.enableGroup(window.RS.groundPolygons, collisions.PunkFallout, this)

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.PunkFallout)
}
