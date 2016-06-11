import GameConsts from '../GameConsts'

const WORLD_WIDTH = 4004
const WORLD_HEIGHT = 927
const BG_WIDTH = WORLD_WIDTH
const BG_HEIGHT = WORLD_HEIGHT
const GROUND_LOOP_SPRITE_Y = 2150

const SPAWN_POINTS = [
    { x: 3200, y: 460 },
    { x: 200, y: 600 },
    { x: 1500, y: 550 },
    { x: 2300, y: 555 },
    { x: 1150, y: 730 },
    { x: 1680, y: 385 },
    { x: 3450, y: 750 },
    { x: 55, y: 314 },
    { x: 3950, y: 340 },
    { x: 430, y: 800 },
    { x: 3455, y: 800 }
]

const LEDGES = [
    { id: 1, x: 0, y: 905, width: 4004, height: 135 },
    { id: 2, x: 0, y: 410, width: 90, height: 300 },
    { id: 3, x: 573, y: 772, width: 430, height: 235 },
    { id: 4, x: 380, y: 173, width: 195, height: 40 },
    { id: 5, x: 1078, y: 236, width: 215, height: 45 },
    { id: 6, x: 1345, y: 185, width: 140, height: 38 },
    { id: 7, x: 1390, y: 715, width: 600, height: 500 },
    { id: 8, x: 1740, y: 590, width: 470, height: 600 },
    { id: 9, x: 2210, y: 748, width: 370, height: 400 },
    { id: 10, x: 2455, y: 187, width: 135, height: 45 },
    { id: 11, x: 2642, y: 238, width: 215, height: 45 },
    { id: 12, x: 2864, y: 786, width: 440, height: 335 },
    { id: 13, x: 3250, y: 237, width: 330, height: 45 },
    { id: 14, x: 3919, y: 430, width: 202, height: 400 },
    { id: 15, x: 0, y: 702, width: 300, height: 505 },
    { id: 16, x: 3620, y: 705, width: 590, height: 305 },
    { id: 17, x: 0, y: 0, width: 8, height: BG_HEIGHT },
    { id: 17, x: BG_WIDTH - 10, y: 0, width: 8, height: BG_HEIGHT }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('background', '/images/maps/dark-forest/background.png', true)
}

export function createOverlays() {

}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.background = this.add.sprite(0, 0, 'background')
    this.background.width = BG_WIDTH
    this.background.height = BG_HEIGHT

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
