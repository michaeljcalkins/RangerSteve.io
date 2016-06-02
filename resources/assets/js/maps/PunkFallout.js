import GameConsts from '../lib/GameConsts'

const WORLD_WIDTH = 2282
const WORLD_HEIGHT = 2854
const BG_WIDTH = 2282
const BG_HEIGHT = 2854
const GROUND_LOOP_SPRITE_Y = 2850

const SPAWN_POINTS = [
    { x: 600, y: 2402 },
    { x: 1000, y: 2402 },
    { x: 1627, y: 2272 },
    { x: 380, y: 1585 },
    { x: 400, y: 1200 },
    { x: 1600, y: 1200 },
    { x: 1637, y: 770 },
    { x: 320, y: 770 },
    { x: 466, y: 220 },
    { x: 400, y: 1600 },
    { x: 1700, y: 1800 }
]

const LEDGES = [
    { id: 1, x: 174, y: 892, width: 512, height: 135 },
    { id: 2, x: 0, y: 0, width: 175, height: 3000 },
    { id: 3, x: 874, y: 892, width: 990, height: 135 },
    { id: 4, x: 1862, y: 0, width: 450, height: 3000 },
    { id: 5, x: 46, y: 1302, width: 990, height: 135 },
    { id: 6, x: 1290, y: 1302, width: 990, height: 135 },
    { id: 7, x: 100, y: 1302, width: 200, height: 500 },
    { id: 8, x: 392, y: 2502, width: 873, height: 135 },
    { id: 9, x: 175, y: 2042, width: 393, height: 135 },
    { id: 10, x: 175, y: 1702, width: 325, height: 135 },
    { id: 11, x: 720, y: 1712, width: 940, height: 135 },
    { id: 12, x: 1055, y: 1847, width: 200, height: 335 },
    { id: 13, x: 1728, y: 2014, width: 175, height: 335 },
    { id: 14, x: 1395, y: 2349, width: 475, height: 135 },
    { id: 15, x: 302, y: 327, width: 795, height: 105 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('map-bg', '/images/maps/punk-fallout/background.png', true)
}

export function createOverlays() {

}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.skysprite = this.add.sprite(0, 0, 'map-bg')
    this.skysprite.width = BG_WIDTH
    this.skysprite.height = BG_HEIGHT

    this.platforms = this.add.group()
    this.platforms.enableBody = true
    createLedges.call(this)
    this.platforms.setAll('body.immovable', true)
    this.platforms.setAll('body.allowGravity', false)

    this.groundLoopSprite = this.add.sprite(0, GROUND_LOOP_SPRITE_Y, 'ground')
    this.groundLoopSprite.alpha = 0
    this.groundLoopSprite.width = this.game.world.width
    this.groundLoopSprite.height = 10
    this.physics.arcade.enable(this.groundLoopSprite)
    this.game.physics.enable(this.groundLoopSprite, Phaser.Physics.ARCADE)
    this.groundLoopSprite.enableBody = true
    this.groundLoopSprite.physicsBodyType = Phaser.Physics.ARCADE
    this.groundLoopSprite.body.immovable = true
    this.groundLoopSprite.body.allowGravity = false
}

export function createLedges() {
    LEDGES.forEach((ledge) => {
        if (GameConsts.DEBUG) {
            let newLedge = this.platforms.create(ledge.x, ledge.y, 'ground')
            newLedge.alpha = 0.4
            newLedge.height = ledge.height
            newLedge.width = ledge.width
            let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
            let text = this.game.add.text(ledge.x, ledge.y, ledge.id, style)
            text.alpha = 0.2
            return
        }

        let newLedge = this.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height
        newLedge.width = ledge.width
    })
}

export function update() {
    this.physics.arcade.collide(this.player, this.groundLoopSprite, () => {
        this.player.y = 100
    })
}
