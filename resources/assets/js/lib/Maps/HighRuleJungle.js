import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'
import collisions from './collisions'

const WORLD_WIDTH = 6000
const WORLD_HEIGHT = 2975

export function preload () {
  this.game.load.image('background', '/maps/high-rule-jungle/background.png', true)
  this.game.load.image('bridge', '/maps/high-rule-jungle/bridge.png', true)
  this.game.load.image('tower-rail', '/maps/high-rule-jungle/tower-rail.png', true)
}

export function createOverlays () {
  this.bridge = this.game.add.sprite(1313, 1240, 'bridge')
  this.towerRail = this.game.add.sprite(4230, 1140, 'tower-rail')
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
  this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')

  window.RS.groundPolygons = this.game.add.group()
  this.game.arcadePolygons.enableGroup(window.RS.groundPolygons, collisions.HighRuleJungle, this)

  if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.HighRuleJungle)
}

export function update () {
  if (window.RS.player.y > 2950) {
    KillCurrentPlayer.call(this)
  }
}
