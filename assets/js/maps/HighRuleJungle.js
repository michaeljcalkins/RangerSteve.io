const spawnPoints = [
    { x: 815, y: 1730 },
    { x: 3380, y: 1030 },
    { x: 4437, y: 1550 },
    { x: 6690, y: 1860 },
    { x: 3832, y: 3350 },
    { x: 3775, y: 2300 },
    { x: 2420, y: 2900 }
]

const ledges = [
    { id: 1, x: 2145, y: 2065, width: 135, height: 40 },
    { id: 2, x: 2613, y: 1094, width: 1100, height: 112 },
    { id: 3, x: 3657, y: 3446, width: 500, height: 600 },
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

export default class HighRuleJungle {
    constructor(rootScope) {
        this.rootScope = rootScope
    }

    getRandomSpawnPoint() {
        return _.sample(spawnPoints)
    }

    createOverlays() {
        this.rootScope.bridge = this.rootScope.add.sprite(1751, 1655, 'bridge')
        this.rootScope.towerRail = this.rootScope.add.sprite(5643, 1525, 'tower-rail')
    }

    create() {
        this.rootScope.skysprite = this.rootScope.add.tileSprite(0, 0, this.rootScope.game.world.width, this.rootScope.game.world.height, 'map-bg')
        this.rootScope.platforms = this.rootScope.add.group()
        this.rootScope.platforms.enableBody = true
        this.createLedges()
        this.rootScope.platforms.setAll('body.immovable', true)
        this.rootScope.platforms.setAll('body.allowGravity', false)
        this.rootScope.statue = this.rootScope.add.sprite(2300, 2781, 'statue')
    }

    createLedges() {
        ledges.forEach((ledge) => {
            // var newLedge = this.rootScope.platforms.create(ledge.x, ledge.y, 'ground')
            var newLedge = this.rootScope.platforms.create(ledge.x, ledge.y)
            newLedge.height = ledge.height
            newLedge.width = ledge.width

            // Debug stuff
            // newLedge.alpha = 0.4
            // let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
            // let text = this.rootScope.game.add.text(ledge.x, ledge.y, ledge.id, style)
            // text.alpha = 0.2
        })
    }
}
