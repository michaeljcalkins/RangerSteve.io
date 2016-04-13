'use strict'

let HighRuleDesert = {}

HighRuleDesert.create = function() {
    this.spawnPoints = [
        {
            x: 815,
            y: 1730
        },
        {
            x: 3380,
            y: 1030
        },
        {
            x: 4437,
            y: 1550
        },
        {
            x: 6690,
            y: 1860
        },
        {
            x: 3832,
            y: 3350
        },
        {
            x: 3775,
            y: 2400
        },
        {
            x: 2420,
            y: 2900
        }
    ]

    HighRuleDesert.createSkySprite.call(this)
    HighRuleDesert.createPlatforms.call(this)
    HighRuleDesert.createLedges.call(this)

    this.platforms.setAll('body.immovable', true)
    this.platforms.setAll('body.allowGravity', false)
}

HighRuleDesert.createSkySprite = function() {
    this.skysprite = this.add.tileSprite(0, this.game.world.height - 3930, this.game.world.width, this.game.world.height, 'map-bg')
}

HighRuleDesert.createPlatforms = function() {
    this.platforms = this.add.group()
    this.platforms.enableBody = true
}

HighRuleDesert.getRandomSpawnPoint = function() {
    return _.sample(this.spawnPoints)
}

HighRuleDesert.createLedges = function() {
    let ledges = [
        { id: 1, x: 2145, y: 2102, width: 135, height: 40 },
        { id: 2, x: 2613, y: 1131, width: 1100, height: 112 },
        { id: 3, x: 3657, y: 3483, width: 545, height: 500 },
        { id: 4, x: 5217, y: 1975, width: 380, height: 600 },
        { id: 5, x: 422, y: this.game.world.height - 2105, width: 1150, height: 300 },
        { id: 6, x: 1555, y: this.game.world.height - 2180, width: 270, height: 730 },
        { id: 7, x: 1820, y: this.game.world.height - 2180, width: 470, height: 6 },
        { id: 8, x: 2275, y: this.game.world.height - 2180, width: 320, height: 630 },
        { id: 9, x: 2595, y: 1704, width: 1120, height: 260 },
        { id: 10, x: 4299, y: 1658, width: 375, height: 1300 },

        { id: 11, x: 1825, y: 2335, width: 160, height: 152 },
        { id: 12, x: 5644, y: 1610, width: 330, height: 20 },
        { id: 13, x: 4673, y: 2054, width: 570, height: 254 },
        { id: 14, x: 2948, y: 3174, width: 380, height: 300 },
        { id: 15, x: 3965, y: 2070, width: 341, height: 700 },
        { id: 16, x: 1909, y: 3008, width: 1040, height: 500 },
        { id: 17, x: 6628, y: 1627, width: 385, height: 37 },
        { id: 18, x: 6628, y: 1215, width: 385, height: 37 },
        { id: 19, x: 5590, y: 2075, width: 350, height: 600 },
        { id: 20, x: 6981, y: 2026, width: 450, height: 167 },
        { id: 21, x: 3665, y: 2438, width: 310, height: 500 },
        { id: 22, x: 3303, y: 2636, width: 400, height: 300 },
        { id: 23, x: 5940, y: 2055, width: 1050, height: 600 }
    ]

    ledges.forEach((ledge) => {
        // var newLedge = this.platforms.create(ledge.x, ledge.y, 'ground')
        var newLedge = this.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height
        newLedge.width = ledge.width

        // Debug stuff
        // newLedge.alpha = 0.4
        // let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
        // let text = this.game.add.text(ledge.x, ledge.y, ledge.id, style)
        // text.alpha = 0.2
    })
}

module.exports = HighRuleDesert
