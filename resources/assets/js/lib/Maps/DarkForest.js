import GameConsts from '../GameConsts'

const WORLD_WIDTH = 4004
const WORLD_HEIGHT = 927
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT
const GROUND_LOOP_SPRITE_Y = 2150

const SPAWN_POINTS = [
    { x: 3200, y: 460 },
    { x: 100, y: 690 },
    { x: 1500, y: 550 },
    { x: 2300, y: 555 },
    { x: 1150, y: 730 },
    { x: 1680, y: 385 },
    { x: 3450, y: 750 },
    // { x: 320, y: 770 },
    // { x: 466, y: 220 },
    // { x: 400, y: 1600 },
    // { x: 1700, y: 1800 }
]

const LEDGES = [
    { id: 1, x: 0, y: 805, width: 4004, height: 135 },
    // { id: 2, x: 0, y: 0, width: 4004, height: 80 },
    { id: 3, x: 570, y: 630, width: 430, height: 235 },
    { id: 4, x: 430, y: 255, width: 195, height: 40 },
    { id: 5, x: 992, y: 285, width: 195, height: 45 },
    { id: 6, x: 1225, y: 240, width: 120, height: 40 },
    { id: 7, x: 1390, y: 590, width: 600, height: 500 },
    { id: 8, x: 1740, y: 467, width: 470, height: 600 },
    { id: 9, x: 2210, y: 640, width: 370, height: 400 },
    { id: 10, x: 2440, y: 253, width: 110, height: 35 },
    { id: 11, x: 2588, y: 290, width: 175, height: 45 },
    { id: 12, x: 2864, y: 650, width: 440, height: 335 },
    { id: 13, x: 2995, y: 315, width: 330, height: 45 },
    { id: 14, x: 3060, y: 180, width: 202, height: 47 },
    { id: 15, x: 0, y: 732, width: 300, height: 105 },
    { id: 16, x: 3620, y: 705, width: 590, height: 305 }
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
