import GameConsts from '../GameConsts'
import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'

const WORLD_WIDTH = 8000
const WORLD_HEIGHT = 3966
const SPAWN_POINTS = [
    { x: 815, y: 1730 },
    { x: 3380, y: 1030 },
    { x: 4437, y: 1550 },
    { x: 6690, y: 1860 },
    { x: 3832, y: 3350 },
    { x: 3775, y: 2300 },
    { x: 2420, y: 2900 }
]
const LEDGES = [
    { id: 1, x: 500, y: 500, width: 135, height: 40 },
    { id: 2, x: 2613, y: 1094, width: 1100, height: 112 },
    { id: 3, x: 3657, y: 3446, width: 550, height: 600 },
    { id: 4, x: 5217, y: 1938, width: 380, height: 600 },
    { id: 5, x: 422, y: 1824, width: 1150, height: 300 },
    { id: 6, x: 1555, y: 1749, width: 270, height: 730 },
    { id: 7, x: 1820, y: 1749, width: 470, height: 6 },
    { id: 8, x: 2275, y: 1749, width: 320, height: 630 },
    { id: 9, x: 2595, y: 1667, width: 1120, height: 260 },
    { id: 10, x: 4304, y: 1621, width: 375, height: 1300 },
    { id: 11, x: 1825, y: 2298, width: 160, height: 152 },
    { id: 12, x: 5644, y: 1573, width: 330, height: 20 },
    { id: 13, x: 4673, y: 2017, width: 570, height: 254 },
    { id: 14, x: 2948, y: 3137, width: 380, height: 300 },
    { id: 15, x: 3983, y: 2028, width: 341, height: 700 },
    { id: 16, x: 1912, y: 2967, width: 1045, height: 500 },
    { id: 17, x: 6628, y: 1590, width: 385, height: 37 },
    { id: 18, x: 6628, y: 1178, width: 385, height: 37 },
    { id: 19, x: 5590, y: 2038, width: 350, height: 600 },
    { id: 20, x: 6984, y: 1989, width: 450, height: 167 },
    { id: 21, x: 3672, y: 2401, width: 330, height: 500 },
    { id: 22, x: 3303, y: 2599, width: 400, height: 300 },
    { id: 23, x: 5940, y: 2018, width: 1050, height: 600 }
]

export function getRandomSpawnPoint() {
    return _.sample(SPAWN_POINTS)
}

export function preload() {
    this.load.image('map-bg', '/images/maps/high-rule-jungle/background.png', true)
    this.load.image('bridge', '/images/maps/high-rule-jungle/bridge.png', true)
    this.load.image('tower-rail', '/images/maps/high-rule-jungle/tower-rail.png', true)
}

export function createOverlays() {
    this.bridge = this.add.sprite(1751, 1655, 'bridge')
    this.towerRail = this.add.sprite(5643, 1525, 'tower-rail')
}

export function create() {
    this.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.skysprite = this.add.sprite(0, 0, 'map-bg')
    this.skysprite.width = this.game.world.width
    this.skysprite.height = this.game.world.height
    this.platforms = this.add.group()
    this.platforms.enableBody = true
    createLedges.call(this)
    this.platforms.setAll('body.immovable', true)
    this.platforms.setAll('body.allowGravity', false)

    this.groundSprite = this.add.sprite(0, 3964, 'ground')
    this.groundSprite.alpha = 0
    this.groundSprite.width = this.game.world.width
    this.groundSprite.height = 10
    this.physics.arcade.enable(this.groundSprite)
    this.game.physics.enable(this.groundSprite, Phaser.Physics.ARCADE)
    this.groundSprite.enableBody = true
    this.groundSprite.physicsBodyType = Phaser.Physics.ARCADE
    this.groundSprite.body.immovable = true
    this.groundSprite.body.allowGravity = false
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
    this.physics.arcade.collide(this.player, this.groundSprite, () => {
        if (this.player.meta.health <= 0 || this.player.y < 3900) return

        this.game.input.enabled = false
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0
        this.player.meta.health = 0
        this.leftArmGroup.visible = false
        this.rightArmGroup.visible = false
        this.headGroup.visible = false
        this.torsoGroup.visible = false

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })

        this.player.animations.play('death')
    })
}
