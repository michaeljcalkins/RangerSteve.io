'use strict'

let MapCtf1 = {}

MapCtf1.create = function(scope) {
    this.scope = scope

    this.createSkySprite()
    this.createPlatforms()
    this.createLedges()

    this.scope.platforms.setAll('body.immovable', true)
    this.scope.platforms.setAll('body.allowGravity', false)
}

MapCtf1.createLedges = function() {
    let ledges = [
        // {x, y, width, height}

        // Starting Ledges
        { id: 1, x: 0, y: this.scope.game.world.height - 431, width: 128, height: 92 }, // Left bottom ledge
        { id: 2, x: 0, y: this.scope.game.world.height - 838, width: 128, height: 92 }, // Left top ledge

        { id: 3, x: 3872, y: this.scope.game.world.height - 427, width: 128, height: 92 }, // Right bottom ledge
        { id: 4, x: 3872, y: this.scope.game.world.height - 835, width: 128, height: 92 }, // Right top ledge

        // Ground Ledges
        { id: 5, x: 0, y: this.scope.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting left ledge
        { id: 6, x: 474, y: this.scope.game.world.height - 256, width: 641, height: 260 }, // Main bottom left ledge
        { id: 7, x: 1115, y: this.scope.game.world.height - 384, width: 1785, height: 390 }, // Main bottom center ledge
        { id: 8, x: 2900, y: this.scope.game.world.height - 256, width: 641, height: 260 }, // Main bottom right ledge
        { id: 9, x: 3540, y: this.scope.game.world.height - 128, width: 474, height: 128 }, // Main bottom starting right ledge

        // Air Ledges
        { id: 10, x: 300, y: this.scope.game.world.height - 608, width: 641, height: 92 },
        { id: 11, x: 1110, y: this.scope.game.world.height - 701, width: 513, height: 92 },
        { id: 12, x: 870, y: this.scope.game.world.height - 982, width: 256, height: 92 },
        { id: 13, x: 1744, y: this.scope.game.world.height - 874, width: 507, height: 254 },
        { id: 14, x: 2390, y: this.scope.game.world.height - 689, width: 513, height: 92 },
        { id: 15, x: 3031, y: this.scope.game.world.height - 608, width: 641, height: 92 },
        { id: 16, x: 2903, y: this.scope.game.world.height - 957, width: 256, height: 92 },

        // Boxes
        { id: 17, x: 717, y: this.scope.game.world.height - 686, width: 155, height: 77 },
        { id: 18, x: 757, y: this.scope.game.world.height - 763, width: 77, height: 77 },
        { id: 19, x: 1418, y: this.scope.game.world.height - 778, width: 77, height: 77 }
    ]


    ledges.forEach((ledge) => {
        var newLedge = this.scope.platforms.create(ledge.x, ledge.y, 'ground')
        // var newLedge = this.scope.platforms.create(ledge.x, ledge.y)
        newLedge.height = ledge.height
        newLedge.width = ledge.width

        // Debug stuff
        newLedge.alpha = 0.2
        let style = { font: "20px Arial", fill: "#ff0044", align: "center", backgroundColor: "#ffff00" }
        let text = this.scope.game.add.text(ledge.x, ledge.y, ledge.id, style)
        text.alpha = 0.2
    })
}

MapCtf1.createSkySprite = function() {
    this.scope.add.tileSprite(0, this.scope.game.world.height - 1500, this.scope.game.world.width, 1500, 'treescape')
}

MapCtf1.createPlatforms = function() {
    this.scope.platforms = this.scope.add.group()
    this.scope.platforms.enableBody = true
}

module.exports = MapCtf1
