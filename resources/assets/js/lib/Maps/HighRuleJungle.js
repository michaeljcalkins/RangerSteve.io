import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer.js'
import CreateSpawnPointVisuals from '../CreateSpawnPointVisuals'

import flatten from 'lodash/flatten'

const WORLD_WIDTH = 6000
const WORLD_HEIGHT = 2975

const polygonPoints = [
  [
    [1427, 2218],
    [2207, 2218],
    [2205, 2345],
    [2485, 2345],
    [2494, 2606],
    [1673, 2611],
    [1605, 2543],
    [1503, 2414],
    [1430, 2271]
  ],
  [
    [2695, 2971],
    [2727, 2891],
    [2731, 2576],
    [3137, 2577],
    [3138, 2855],
    [3175, 2969]
  ],
  [
    [2520, 2180],
    [2453, 2024],
    [2466, 1986],
    [2468, 1940],
    [2740, 1939],
    [2745, 1793],
    [2973, 1787],
    [2976, 1513],
    [3232, 1512],
    [3227, 1423],
    [3216, 1408],
    [3212, 1362],
    [3220, 1346],
    [3215, 1208],
    [3504, 1206],
    [3503, 1280],
    [3489, 1299],
    [3504, 1448],
    [3529, 1503],
    [3904, 1502],
    [3905, 1443],
    [4190, 1445],
    [4190, 1516],
    [4440, 1517],
    [4448, 1506],
    [5226, 1505],
    [5233, 1487],
    [5568, 1485],
    [5575, 1598],
    [5375, 1686]
  ],
  [
    [2776, 1241],
    [2777, 1317],
    [2756, 1342],
    [2759, 1383],
    [2755, 1460],
    [2728, 1496],
    [2678, 1505],
    [2601, 1571],
    [2462, 1633],
    [2316, 1784],
    [2131, 1786],
    [2084, 1846],
    [2014, 1790],
    [1691, 1781],
    [1703, 1583],
    [1604, 1560],
    [1603, 1543],
    [1693, 1540],
    [1696, 1305],
    [1936, 1302],
    [1942, 1242],
    [2087, 1242],
    [2112, 1196],
    [2123, 1227],
    [2143, 1242]
  ],
  [
    [4222, 1167],
    [4466, 1167],
    [4468, 1185],
    [4221, 1183]
  ],
  [
    [4962, 1183],
    [5248, 1184],
    [5240, 1200],
    [5249, 1208],
    [5044, 1210],
    [4961, 1190]
  ],
  [
    [4962, 876],
    [5249, 878],
    [5249, 898],
    [4962, 901]
  ]
]

export function preload () {
  this.game.load.image('background', '/maps/high-rule-jungle/background.jpg', true)
  this.game.load.image('bridge', '/maps/high-rule-jungle/bridge.png', true)
  this.game.load.image('tower-rail', '/maps/high-rule-jungle/tower-rail.png', true)
}

export function createOverlays () {
  this.bridge = this.game.add.sprite(1313, 1240, 'bridge')
  this.towerRail = this.game.add.sprite(4230, 1140, 'tower-rail')
}

export function create () {
  this.game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  // FireFox allows a max width of 4000px for this image
  let background = this.game.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'background')
  background.scale.y = 1.5
  background.scale.x = 1.5

  const decomposedPolygonPoints = []
  polygonPoints.forEach((polygon) => {
    const decomposedPolygon = decomp.quickDecomp(polygon)
    decomposedPolygon.forEach((p) => {
      decomposedPolygonPoints.push(flatten(p))
    })
  })

  console.log('* LOG * decomposedPolygonPoints', decomposedPolygonPoints)
  console.log('* LOG * polygonPoints', polygonPoints)

  window.RS.groundPolygons = this.game.add.group()
  this.game.physics.arcade.enable(window.RS.groundPolygons)
  this.game.arcadePolygons.enableGroup(window.RS.groundPolygons, decomposedPolygonPoints, this)

  // Render the polygons so that we can see them!
  for (var i in window.RS.groundPolygons.children) {
    var polygon = window.RS.groundPolygons.children[i]
    var graphics = this.game.add.graphics(polygon.body.sat.polygon.pos.x, polygon.body.sat.polygon.pos.y)
    graphics.beginFill(Phaser.Color.getRandomColor(100, 200))
    graphics.drawPolygon(polygon.body.sat.polygon.points)
    graphics.endFill()
  }

  // if (GameConsts.DEBUG) CreateSpawnPointVisuals.call(this, GameConsts.MAP_SPAWN_POINTS.HighRuleJungle)
}

export function update () {

}
