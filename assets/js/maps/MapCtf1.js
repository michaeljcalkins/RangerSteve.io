'use strict'

let MapCtf1 = {}

MapCtf1.create = function(scope) {
    this.scope = scope

    this.createSkySprite()
    this.createPlatforms()
    this.createLeftStartingLedge()
    this.createLeftSecondLedge()
    this.createLeftLedges()

    // var leftPlayerBackLedge2 = this.scope.platforms.create(0, this.scope.game.world.height - 800, 'ground');
    // leftPlayerBackLedge2.height = 200
    // leftPlayerBackLedge2.width = 200

    // var mainCenterTopLedge = this.scope.platforms.create(700, this.scope.game.world.height - 600, 'ground');
    // mainCenterTopLedge.height = 50
    // mainCenterTopLedge.width = 2000

    // var mainCenterLedge = this.scope.platforms.create(1000, this.scope.game.world.height - 200, 'ground');
    // mainCenterLedge.height = 400
    // mainCenterLedge.width = 2000

    // var rightPlayerStartingLedge = this.scope.platforms.create(this.scope.game.world.width - 1000, this.scope.game.world.height - 100, 'ground');
    // rightPlayerStartingLedge.height = 300
    // rightPlayerStartingLedge.width = 1000

    this.scope.platforms.setAll('body.immovable', true)
    this.scope.platforms.setAll('body.allowGravity', false)
}

MapCtf1.createSkySprite = function() {
    this.scope.add.tileSprite(0, this.scope.game.world.height - 1500, this.scope.game.world.width, 1500, 'treescape')
}

MapCtf1.createPlatforms = function() {
    this.scope.platforms = this.scope.add.group()
    this.scope.platforms.enableBody = true
}

MapCtf1.createLeftSecondLedge = function() {
    var ledge = this.scope.platforms.create(474, this.scope.game.world.height - 256, 'ground');
    ledge.height = 260
    ledge.width = 645
    ledge.alpha = 0.2
}

MapCtf1.createLeftStartingLedge = function() {
    var ledge = this.scope.platforms.create(0, this.scope.game.world.height - 128, 'ground');
    ledge.height = 130
    ledge.width = 474
    ledge.alpha = 0.2
}

MapCtf1.createLeftLedges = function() {
    var ledge = this.scope.platforms.create(0, this.scope.game.world.height - 431, 'ground');
    ledge.height = 92
    ledge.width = 128
    ledge.alpha = 0.2
}

module.exports = MapCtf1
