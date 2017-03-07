import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'
import collisions from './collisions'

const WORLD_WIDTH = 3232
const WORLD_HEIGHT = 2400

export function preload () {
  this.game.load.image('background', '/maps/evil-underground/background.jpg', true)
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  window.RS.groundPolygons = this.game.add.group()
  this.game.arcadePolygons.enableGroup(window.RS.groundPolygons, collisions.EvilUnderground, this)

  if (GameConsts.DEBUG || window.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.EvilUnderground)
}

export function update () {
  if (window.RS.player.y > 2285) {
    KillCurrentPlayer.call(this)
  }
}
