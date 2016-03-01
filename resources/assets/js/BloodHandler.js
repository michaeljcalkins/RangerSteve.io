'use strict'

function BloodHandler(main) {
    this.size = 8;
    this.startHp = 30;
    this.list = [];
    this.pool = []
}

BloodHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.blockSize = main.blockSize;
    this.blockInt = main.blockInt;
    this.gridList = main.gridHandler.list;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight
};

BloodHandler.prototype.enterFrame = function() {
    var blockSize = this.blockSize;
    var blockInt = this.blockInt;
    var gridList = this.gridList;
    var levelWidth = this.levelWidth;
    var levelHeight = this.levelHeight;
    var blood, X, Y;
    for (var i = this.list.length - 1; i >= 0; i--) {
        blood = this.list[i];
        blood.x += blood.vX;
        blood.y += blood.vY;
        blood.vY += 0.2;
        blood.hp--;
        X = blood.x / blockSize | 0;
        Y = blood.y / blockSize | 0;
        if (X >= 0 && X < levelWidth && Y >= 0 && Y < levelHeight) {
            if (gridList[X][Y] == blockInt.water) {
                blood.x -= blood.vX * 0.5;
                blood.y -= blood.vY * 0.5
            } else if (gridList[X][Y] !== false && gridList[X][Y] != blockInt.cloud && gridList[X][Y] != blockInt.platform) {
                blood.hp *= 0.75
            }
        }
        if (blood.hp <= 0) {
            this.pool[this.pool.length] = blood;
            this.list.splice(i, 1);
            continue
        }
    }
}

BloodHandler.prototype.create = function(x, y, vX, vY, count) {
    for (var i = 0; i < count; i++) {
        if (this.pool.length > 0) {
            var blood = this.pool.pop()
        } else {
            var blood = new Object()
        }
        blood.x = x;
        blood.y = y;
        blood.vX = vX + Math.random() * 6 - 3;
        blood.vY = vY + Math.random() * 6 - 3;
        blood.hp = this.startHp;
        this.list[this.list.length] = blood
    }
};
