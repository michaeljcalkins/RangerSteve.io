'use strict'

let HighRuleDesert = {}

HighRuleDesert.create = function() {
    this.spawnPoints = [
        {
            x: 500,
            y: this.world.height - 2300
        },
        // {
        //     x: 200,
        //     y: this.world.height - 200
        // },
        // {
        //     x: 3750,
        //     y: this.world.height - 200
        // },
        // {
        //     x: 3450,
        //     y: this.world.height - 700
        // },
        // {
        //     x: 2600,
        //     y: this.world.height - 800
        // },
        // {
        //     x: 1250,
        //     y: this.world.height - 800
        // }
    ]

    HighRuleDesert.createSkySprite.call(this)
    HighRuleDesert.createPlatforms.call(this)
    HighRuleDesert.createLedges.call(this)

    this.platforms.setAll('body.immovable', true)
    this.platforms.setAll('body.allowGravity', false)
}

HighRuleDesert.createSkySprite = function() {
    let skysprite = this.add.tileSprite(0, this.game.world.height - 3930, this.game.world.width, this.game.world.height, 'map-bg')
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
        // {x, y, width, height}

        // Starting Ledges
        { id: 1, x: 0, y: this.game.world.height - 431, width: 128, height: 92 }, // Left bottom ledge
        { id: 2, x: 0, y: this.game.world.height - 838, width: 128, height: 92 }, // Left top ledge

        { id: 3, x: 3872, y: this.game.world.height - 427, width: 128, height: 92 }, // Right bottom ledge
        { id: 4, x: 3872, y: this.game.world.height - 835, width: 128, height: 92 }, // Right top ledge

        // Ground Ledges
        { id: 5, x: 363, y: this.game.world.height - 2105, width: 8150, height: 300 }, // Main bottom starting left ledge
        { id: 6, x: 474, y: this.game.world.height - 256, width: 641, height: 260 }, // Main bottom left ledge
        { id: 7, x: 1115, y: this.game.world.height - 384, width: 1785, height: 390 }, // Main bottom center ledge
        { id: 8, x: 2900, y: this.game.world.height - 256, width: 641, height: 260 }, // Main bottom right ledge
        { id: 9, x: 3540, y: this.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting right ledge

        // Air Ledges
        { id: 10, x: 300, y: this.game.world.height - 608, width: 641, height: 92 },
        { id: 11, x: 1110, y: this.game.world.height - 701, width: 513, height: 92 },
        { id: 12, x: 870, y: this.game.world.height - 982, width: 256, height: 92 },
        { id: 13, x: 1744, y: this.game.world.height - 1474, width: 507, height: 254 },
        { id: 14, x: 2390, y: this.game.world.height - 689, width: 513, height: 92 },
        { id: 15, x: 3031, y: this.game.world.height - 608, width: 641, height: 92 },
        { id: 16, x: 2903, y: this.game.world.height - 957, width: 256, height: 92 },

        // Boxes
        { id: 17, x: 717, y: this.game.world.height - 685, width: 154, height: 77 },
        { id: 18, x: 757, y: this.game.world.height - 762, width: 77, height: 77 },
        { id: 19, x: 1418, y: this.game.world.height - 778, width: 77, height: 77 },
        { id: 20, x: 1931, y: this.game.world.height - 461, width: 154, height: 77 },
        { id: 21, x: 3205, y: this.game.world.height - 685, width: 154, height: 77 },
        { id: 22, x: 3245, y: this.game.world.height - 762, width: 77, height: 77 }
    ]

    ledges.forEach((ledge) => {
        var newLedge = this.platforms.create(ledge.x, ledge.y, 'ground')
        // var newLedge = this.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height
        newLedge.width = ledge.width

        // Debug stuff
        newLedge.alpha = 0.2
        let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
        let text = this.game.add.text(ledge.x, ledge.y, ledge.id, style)
        text.alpha = 0.2
    })

    let poly = new Phaser.Polygon([ new Phaser.Point(200, 100), new Phaser.Point(350, 100), new Phaser.Point(375, 200), new Phaser.Point(150, 200) ]);

    let graphics = this.game.add.graphics(0, 0);

    graphics.beginFill(0xFF33ff);
    graphics.drawPolygon(poly.points);
    graphics.endFill();

}

module.exports = HighRuleDesert
