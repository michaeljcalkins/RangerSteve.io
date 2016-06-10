import GameConsts from '../GameConsts'

const WORLD_WIDTH = 4004
const WORLD_HEIGHT = 927
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT
const GROUND_LOOP_SPRITE_Y = 2150

const SPAWN_POINTS = [
    { x: 2800, y: 400 },
    // { x: 1000, y: 2402 },
    // { x: 1627, y: 2272 },
    // { x: 380, y: 1585 },
    // { x: 400, y: 1200 },
    // { x: 1600, y: 1200 },
    // { x: 1637, y: 770 },
    // { x: 320, y: 770 },
    // { x: 466, y: 220 },
    // { x: 400, y: 1600 },
    // { x: 1700, y: 1800 }
]

const LEDGES = [
    { id: 1, x: 0, y: 885, width: 4004, height: 135 },
    { id: 2, x: 0, y: 0, width: 3613, height: 20 },
    { id: 3, x: 540, y: 615, width: 420, height: 235 },
    { id: 4, x: 250, y: 280, width: 195, height: 45 },
    { id: 5, x: 740, y: 315, width: 195, height: 45 },
    { id: 6, x: 975, y: 270, width: 120, height: 42 },
    { id: 7, x: 1210, y: 570, width: 600, height: 500 },
    { id: 8, x: 1552, y: 436, width: 470, height: 600 },
    { id: 9, x: 2010, y: 630, width: 375, height: 400 },
    { id: 10, x: 2362, y: 286, width: 110, height: 45 },
    { id: 11, x: 2510, y: 330, width: 175, height: 45 },
    { id: 12, x: 2616, y: 611, width: 425, height: 335 },
    { id: 13, x: 2995, y: 355, width: 330, height: 50 },
    { id: 14, x: 3060, y: 210, width: 202, height: 50 },
    { id: 15, x: 7, y: 727, width: 290, height: 105 },
    { id: 16, x: 3060, y: 690, width: 290, height: 105 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('map-bg', '/images/maps/dark-forest/background.png', true)
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
