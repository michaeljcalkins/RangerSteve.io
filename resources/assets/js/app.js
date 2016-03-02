'use strict'

/**
 * http://www.h3xed.com/blogmedia/platformer2/
 */

let gameState = {
    // Block height and width
    blockSize: 16,

    canvas: document.getElementById('canvas'),

    // Multiplier for the game level's height and width.
    levelWidth: 500,
    levelHeight: 100,

    // Instantiates these objects to interact with the gameState.
    handlers: ['control', 'grid', 'render', 'player', 'enemy', 'shot', 'dust', 'blood', 'view'],

    horizon: null,

    // Used when rendering all text.
    fontFamily: '"Segoe UI",Arial,sans-serif',

    // Time until the EnemyHandlers start appearing.
    dayLength: 480 * 60,

    // Types of blocks to generate the map from.
    blocks: {
        bedrock: '#363532',
        dirt: '#AE9A73',
        stone: '#807E79',
        wood: '#9F763B',
        water: 'rgba(0,72,151,0.5)',
        cloud: 'rgba(255,255,255,0.7)',
        platform: '#9F763B'
    },

    //
    blockInt: {},

    //
    blockColor: [],

    // Current view of the game.
    state: 'loading',

    // Current time of game.
    time: 0
}

window.onload = function() {
    new Main()
};

function Main() {
    var i = 0;
    for (var block in gameState.blocks) {
        gameState.blockInt[block] = i;
        gameState.blockColor[i] = gameState.blocks[block];
        i++
    }

    gameState.state = 'loading';

    // Create basis for level
    this.context = gameState.canvas.getContext('2d');
    gameState.horizon = gameState.levelHeight / 2 | 0;

    // Instatiate all behaviors
    for (i = 0; i < gameState.handlers.length; i++) {
        var handlerName = gameState.handlers[i] + 'Handler';
        var className = handlerName.charAt(0).toUpperCase() + handlerName.slice(1);
        this[handlerName] = new window[className](this)
    }

    setInterval(this.enterFrame.bind(this), 1000 / 60);
    new MenuScreen(this)
}

Main.prototype.startGame = function() {
    for (var i = 0; i < gameState.handlers.length; i++) {
        this[gameState.handlers[i] + 'Handler'].init(this)
    }
    new CreateLevel(this);
    gameState.state = 'game';
    gameState.time = gameState.dayLength * 0.37
};

Main.prototype.enterFrame = function() {
    if (gameState.state != 'game') {
        return
    }

    if (this.playerHandler.hp <= 0) {
        gameState.state = 'gameOverScreen';
        new GameOverScreen(this);
        return
    }

    gameState.time++;
    if (gameState.time > gameState.dayLength) {
        gameState.time = 0
    }

    for (var i = 0; i < gameState.handlers.length; i++) {
        this[gameState.handlers[i] + 'Handler'].enterFrame()
    }
};

function BloodHandler(main) {
    this.size = 8;
    this.startHp = 30;
    this.list = [];
    this.pool = []
}

BloodHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.gridList = main.gridHandler.list;
};

BloodHandler.prototype.enterFrame = function() {
    var gridList = this.gridList;
    var blood, X, Y;
    for (var i = this.list.length - 1; i >= 0; i--) {
        blood = this.list[i];
        blood.x += blood.vX;
        blood.y += blood.vY;
        blood.vY += 0.2;
        blood.hp--;
        X = blood.x / gameState.blockSize | 0;
        Y = blood.y / gameState.blockSize | 0;
        if (X >= 0 && X < gameState.levelWidth && Y >= 0 && Y < gameState.levelHeight) {
            if (gridList[X][Y] == gameState.blockInt.water) {
                blood.x -= blood.vX * 0.5;
                blood.y -= blood.vY * 0.5
            } else if (gridList[X][Y] !== false && gridList[X][Y] != gameState.blockInt.cloud && gridList[X][Y] != gameState.blockInt.platform) {
                blood.hp *= 0.75
            }
        }
        if (blood.hp <= 0) {
            this.pool[this.pool.length] = blood;
            this.list.splice(i, 1);
            continue
        }
    }
};

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

function ControlHandler(main) {
    this.a = false;
    this.d = false;
    this.s = false;
    this.space = false;
    this.mouseLeft = false;
    this.mouseRight = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.main = main;
    window.addEventListener('keydown', this.keyDownEvent.bind(this));
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
    window.addEventListener('mousedown', this.mouseDownEvent.bind(this));
    window.addEventListener('mouseup', this.mouseUpEvent.bind(this));
    window.addEventListener('mousemove', this.mouseMoveEvent.bind(this));
    window.addEventListener('mousewheel', this.mouseWheelEvent.bind(this));
    window.addEventListener('DOMMouseScroll', this.mouseWheelEvent.bind(this));
    // window.addEventListener('resize', this.windowResizeEvent.bind(this));
    document.getElementById('canvas').addEventListener('contextmenu', function(e) {
        if (e.button == 2) {
            e.preventDefault();
            return false
        }
    })
}

ControlHandler.prototype.init = function(main) {
    this.playerHandler = main.playerHandler
};

ControlHandler.prototype.enterFrame = function() {};

ControlHandler.prototype.keyDownEvent = function(e) {
    if (e.keyCode == 32) {
        this.space = true
    } else if (e.keyCode == 65) {
        this.a = true
    } else if (e.keyCode == 68) {
        this.d = true
    } else if (e.keyCode == 83) {
        this.s = true
    } else if ((e.keyCode >= 48 || e.keyCode <= 57) && gameState.state == 'game') {
        this.playerHandler.hotKey(e.keyCode)
    }

    if (this.mouseX > 0 && this.mouseX < gameState.canvas.width && this.mouseY > 0 && this.mouseY < gameState.canvas.height) {
        e.preventDefault();
        return false
    }
};

ControlHandler.prototype.keyUpEvent = function(e) {
    if (e.keyCode == 32) {
        this.space = false
    } else if (e.keyCode == 65) {
        this.a = false
    } else if (e.keyCode == 68) {
        this.d = false
    } else if (e.keyCode == 83) {
        this.s = false
    }
    if (this.mouseX > 0 && this.mouseX < gameState.canvas.width && this.mouseY > 0 && this.mouseY < gameState.canvas.height) {
        e.preventDefault();
        return false
    }
};

ControlHandler.prototype.mouseDownEvent = function(e) {
    if (e.button == 0) {
        this.mouseLeft = true
    } else if (e.button == 2) {
        this.mouseRight = true
    }
};

ControlHandler.prototype.mouseUpEvent = function(e) {
    if (this.mouseLeft && this.mouseX > 0 && this.mouseX < gameState.canvas.width && this.mouseY > 0 && this.mouseY < gameState.canvas.height) {
        if (gameState.state == 'menuScreen' || gameState.state == 'gameOverScreen') {
            this.main.startGame()
        }
    }
    if (e.button == 0) {
        this.mouseLeft = false
    } else if (e.button == 2) {
        this.mouseRight = false
    }
};
ControlHandler.prototype.mouseMoveEvent = function(e) {
    var rect = gameState.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top
};
ControlHandler.prototype.mouseWheelEvent = function(e) {
    if (gameState.state == 'game') {
        this.playerHandler.wheel(e.wheelDelta ? e.wheelDelta : -e.detail)
    }
    if (this.mouseX > 0 && this.mouseX < gameState.canvas.width && this.mouseY > 0 && this.mouseY < gameState.canvas.height) {
        e.preventDefault();
        return false
    }
};

function CreateLevel(main) {
    var flatness = 0.75;
    var list = main.gridHandler.list;
    var waterList = main.gridHandler.waterList;
    var Y = gameState.horizon;
    var i, j;
    for (i = 0; i < gameState.levelWidth / 20; i++) {
        var randX = Math.random() * (gameState.levelWidth - 20) + 10 | 0;
        var randY = Math.random() * (gameState.levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = 0; k < 9; k++) {
                list[randX + Math.random() * k * 2 - k | 0][randY + Math.random() * k - k / 2 | 0] = gameState.blockInt.cloud
            }
        }
    }
    for (i = 0; i < gameState.levelWidth; i++) {
        if (i == 0 || i == gameState.levelWidth - 1) {
            for (j = 0; j < gameState.levelHeight; j++) {
                list[i][j] = gameState.blockInt.bedrock
            }
            continue
        }
        list[i][0] = gameState.blockInt.bedrock;
        list[i][gameState.levelHeight - 1] = gameState.blockInt.bedrock;
        if (Y > gameState.horizon) {
            for (j = gameState.horizon; j < Y; j++) {
                list[i][j] = gameState.blockInt.water;
                waterList[waterList.length] = {
                    x: i,
                    y: j
                }
            }
        }
        for (j = Y; j < gameState.levelHeight - 1; j++) {
            if (j > Y + Math.random() * 8 + 4) {
                list[i][j] = gameState.blockInt.stone
            } else {
                list[i][j] = gameState.blockInt.dirt
            }
        }
        if (Math.random() < flatness) {
            Y += (Math.random() * 3 | 0) - 1
        }
        if (Y > gameState.horizon && i > gameState.levelWidth / 2 - 20 && i < gameState.levelWidth / 2) {
            Y--
        }
        if (Y > gameState.levelHeight - 1) {
            Y--
        } else if (Y < 1) {
            Y++
        }
    }
    for (i = 0; i < gameState.levelWidth / 25; i++) {
        var randX = Math.random() * (gameState.levelWidth - 20) + 10 | 0;
        var randY = gameState.horizon + Math.random() * (gameState.levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = Math.random() * 8 | 0; k >= 0; k--) {
                var X = randX + Math.random() * k * 2 - k | 0;
                var Y = randY + Math.random() * k - k / 2 | 0;
                list[X][Y] = false
            }
        }
    }
    for (i = 0; i < gameState.levelWidth / 25; i++) {
        var randX = Math.random() * (gameState.levelWidth - 20) + 10 | 0;
        var randY = gameState.horizon + Math.random() * (gameState.levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = Math.random() * 8 | 0; k >= 0; k--) {
                var X = randX + Math.random() * k * 2 - k | 0;
                var Y = randY + Math.random() * k - k / 2 | 0;
                list[X][Y] = gameState.blockInt.water;
                waterList[waterList.length] = {
                    x: X,
                    y: Y
                }
            }
        }
    }
}

function DustHandler(main) {
    this.size = 6;
    this.startHp = 30;
    this.list = [];
    this.pool = []
}
DustHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.gridList = main.gridHandler.list;
};
DustHandler.prototype.enterFrame = function() {
    var gridList = this.gridList;
    var dust, X, Y;
    for (var i = this.list.length - 1; i >= 0; i--) {
        dust = this.list[i];
        dust.x += dust.vX;
        dust.y += dust.vY;
        dust.vY += 0.2;
        dust.hp--;
        X = dust.x / gameState.blockSize | 0;
        Y = dust.y / gameState.blockSize | 0;
        if (X >= 0 && X < gameState.levelWidth && Y >= 0 && Y < gameState.levelHeight) {
            if (gridList[X][Y] == gameState.blockInt.water) {
                dust.x -= dust.vX * 0.5;
                dust.y -= dust.vY * 0.5
            } else if (gridList[X][Y] !== false && gridList[X][Y] != gameState.blockInt.cloud && gridList[X][Y] != gameState.blockInt.platform) {
                dust.hp *= 0.75
            }
        }
        if (dust.hp <= 0) {
            this.pool[this.pool.length] = dust;
            this.list.splice(i, 1);
            continue
        }
    }
};
DustHandler.prototype.create = function(x, y, vX, vY, count) {
    for (var i = 0; i < count; i++) {
        if (this.pool.length > 0) {
            var dust = this.pool.pop()
        } else {
            var dust = new Object()
        }
        dust.x = x;
        dust.y = y;
        dust.vX = vX + Math.random() * 6 - 3;
        dust.vY = vY + Math.random() * 6 - 3;
        dust.hp = this.startHp;
        this.list[this.list.length] = dust
    }
};

function EnemyHandler(main) {
    this.startAccel = 0.01;
    this.startSpeed = 0.5;
    this.fallSpeed = 4.0;
    this.startWidth = 18;
    this.startHeight = 23;
    this.jumpHeight = 6.0;
    this.jumpDelay = 12.0;
    this.startHp = 8;
    this.spawnRate = 0.01;
    this.list = [];
    this.pool = []
}

EnemyHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.main = main;
    this.playerHandler = main.playerHandler;
    this.gridList = main.gridHandler.list;
    this.blood = main.bloodHandler.create.bind(main.bloodHandler);
};

EnemyHandler.prototype.enterFrame = function() {
    var player = this.playerHandler;
    var gridList = this.gridList;
    var enemy, i, j, startX, startY, endX, endY, newX, newY, collide;
    i = gameState.time / gameState.dayLength;
    if ((i < 0.25 || i > 0.75) && Math.random() < this.spawnRate) {
        this.create()
    }
    for (var k = this.list.length - 1; k >= 0; k--) {
        enemy = this.list[k];
        if (enemy.hp <= 0) {
            this.pool[this.pool.length] = enemy;
            this.list.splice(k, 1);
            this.blood(enemy.x, enemy.y, 0, 0, 15);
            this.playerHandler.kills++;
            continue
        }
        if (enemy.canJump < 1 && (player.y < enemy.y - 1 && Math.random() < 0.03 || Math.random() < 0.01)) {
            enemy.vY = -this.jumpHeight
        }
        if (player.x < enemy.x) {
            enemy.vX -= enemy.accel;
            if (enemy.vX < -enemy.speed) {
                enemy.vX = -enemy.speed
            }
        } else {
            enemy.vX += enemy.accel;
            if (enemy.vX > enemy.speed) {
                enemy.vX = enemy.speed
            }
        }
        newX = enemy.x + enemy.vX;
        startX = Math.max((newX - enemy.width / 2) / gameState.blockSize | 0, 0);
        startY = Math.max((enemy.y - enemy.height / 2) / gameState.blockSize | 0, 0);
        endX = Math.min((newX + enemy.width / 2 - 1) / gameState.blockSize | 0, gameState.levelWidth - 1);
        endY = Math.min((enemy.y + enemy.height / 2) / gameState.blockSize | 0, gameState.levelHeight - 1);
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (gridList[i][j] !== false && gridList[i][j] != gameState.blockInt.cloud && gridList[i][j] != gameState.blockInt.platform) {
                    if (gridList[i][j] == gameState.blockInt.water) {
                        enemy.inWater = true;
                        if (enemy.vX > enemy.speed / 2) {
                            enemy.vX = enemy.speed / 2
                        } else if (enemy.vX < -enemy.speed / 2) {
                            enemy.vX = -enemy.speed / 2
                        }
                    } else {
                        if (newX < i * gameState.blockSize) {
                            newX = i * gameState.blockSize - enemy.width / 2
                        } else {
                            newX = i * gameState.blockSize + gameState.blockSize + enemy.width / 2
                        }
                        enemy.vX = 0
                    }
                }
            }
        }
        enemy.x = newX;
        if (enemy.inWater) {
            enemy.vY += 0.25;
            if (enemy.vY > this.fallSpeed * 0.3) {
                enemy.vY = this.fallSpeed * 0.3
            }
            newY = enemy.y + enemy.vY * 0.6
        } else {
            enemy.vY += 0.4;
            if (enemy.vY > this.fallSpeed) {
                enemy.vY = this.fallSpeed
            }
            newY = enemy.y + enemy.vY
        }
        collide = false;
        enemy.inWater = false;
        startX = Math.max((enemy.x - enemy.width / 2) / gameState.blockSize | 0, 0);
        startY = Math.max((newY - enemy.height / 2) / gameState.blockSize | 0, 0);
        endX = Math.min((enemy.x + enemy.width / 2 - 1) / gameState.blockSize | 0, gameState.levelWidth - 1);
        endY = Math.min((newY + enemy.height / 2) / gameState.blockSize | 0, gameState.levelHeight - 1);
        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (gridList[i][j] !== false && gridList[i][j] != gameState.blockInt.cloud && gridList[i][j] != gameState.blockInt.platform) {
                    collide = true;
                    if (gridList[i][j] == gameState.blockInt.water) {
                        enemy.inWater = true;
                        enemy.canJump--
                    } else {
                        if (newY < j * gameState.blockSize) {
                            newY = j * gameState.blockSize - enemy.height / 2 - 0.001;
                            enemy.canJump--
                        } else {
                            newY = j * gameState.blockSize + gameState.blockSize + enemy.height / 2
                        }
                        enemy.vY = 0
                    }
                }
                if (gridList[i][j] == gameState.blockInt.platform && enemy.vY > 0 && player.y < enemy.y - 1) {
                    if (enemy.y + enemy.height * 0.5 < j * gameState.blockSize) {
                        newY = j * gameState.blockSize - enemy.height * 0.5 - 0.001;
                        collide = true;
                        enemy.vY = 0;
                        enemy.canJump--
                    }
                }
            }
        }
        enemy.y = newY;
        if (collide == false) {
            enemy.canJump = this.jumpDelay
        }
        if (enemy.x - enemy.width / 2 < player.x + player.width / 2 && enemy.x + enemy.width / 2 > player.x - player.width / 2 && enemy.y - enemy.height / 2 < player.y + player.height / 2 && enemy.y + enemy.height / 2 > player.y - player.height / 2) {
            this.blood(enemy.x, enemy.y, 0, 0, 5);
            player.hp--;
            player.vX += (player.x - enemy.x) * 0.05;
            player.vY += (player.y - enemy.y) * 0.05
        }
    }
};

EnemyHandler.prototype.create = function() {
    if (this.pool.length > 0) {
        var enemy = this.pool.pop()
    } else {
        var enemy = new Object()
    }

    if (this.playerHandler.x < 500 || (Math.random() < 0.5 && this.playerHandler.x < gameState.levelWidth * gameState.blockSize - 800)) {
        enemy.x = this.playerHandler.x + 500 + Math.random() * 200
    } else {
        enemy.x = this.playerHandler.x - 500 - Math.random() * 200
    }

    enemy.y = 50;
    enemy.vX = 0;
    enemy.vY = 10;
    enemy.hp = this.startHp;
    enemy.accel = this.startAccel;
    enemy.speed = this.startSpeed;
    enemy.width = this.startWidth;
    enemy.height = this.startHeight;
    enemy.canJump = 0;
    enemy.inWater = false;
    this.list[this.list.length] = enemy
};

function GameOverScreen(main) {
    gameState.state = 'gameOverScreen';
    main.controlHandler.mouseLeft = false;
    main.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    var hW = gameState.canvas.width * 0.5;
    var hH = gameState.canvas.height * 0.5;
    var dark = 'rgba(0,0,0,0.9)';
    var medium = 'rgba(0,0,0,0.5)';
    var light = 'rgba(0,0,0,0.3)';
    new Text(main.context, 'Ranger Steve: Buffalo Invasion', 9, 18, 'normal 21px/1 ' + gameState.fontFamily, light, 'left');
    new Text(main.context, 'Game Over!', hW, hH - 70, 'normal 22px/1 ' + gameState.fontFamily, dark);
    new Text(main.context, 'Kills:' + main.playerHandler.kills, hW, hH - 30, 'normal 16px/1 ' + gameState.fontFamily, medium);
    new Text(main.context, 'Click to Restart', hW, hH + 10, 'normal 17px/1 ' + gameState.fontFamily, dark);
}

function GridHandler(main) {}
GridHandler.prototype.init = function(main) {
    this.list = [];
    this.waterList = [];
    this.toggle = 0;

    for (var i = 0; i < gameState.levelWidth; i++) {
        this.list[i] = [];
        for (var j = 0; j < gameState.levelHeight; j++) {
            this.list[i][j] = false
        }
    }
};
GridHandler.prototype.enterFrame = function() {
    var list = this.list;
    // var levelWidth = this.levelWidth;
    // var levelHeight = this.levelHeight;
    var toggle = this.toggle;
    for (var i = this.waterList.length - 1; i >= 0; i--) {
        toggle++;
        if (toggle > 9) {
            toggle = 0
        }
        if (toggle != 0) {
            continue
        }
        var water = this.waterList[i];
        if (list[water.x][water.y] != gameState.blockInt.water) {
            this.waterList.splice(i, 1);
            continue
        }
        if (water.y < gameState.levelHeight && list[water.x][water.y + 1] === false) {
            list[water.x][water.y + 1] = gameState.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x,
                y: water.y + 1
            };
            continue
        }
        if (water.x > 0 && list[water.x - 1][water.y] === false) {
            list[water.x - 1][water.y] = gameState.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x - 1,
                y: water.y
            };
            continue
        }
        if (water.x < gameState.levelWidth - 1 && list[water.x + 1][water.y] === false) {
            list[water.x + 1][water.y] = gameState.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x + 1,
                y: water.y
            };
            continue
        }
    }
    this.toggle++;
    if (this.toggle > 9) {
        this.toggle = 0
    }
};

function MenuScreen(main) {
    gameState.state = 'menuScreen';
    main.controlHandler.mouseLeft = false;
    main.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    var hW = gameState.canvas.width * 0.5;
    var hH = gameState.canvas.height * 0.5;
    var dark = 'rgba(0,0,0,0.9)';
    var medium = 'rgba(0,0,0,0.5)';
    var light = 'rgba(0,0,0,0.3)';
    new Text(main.context, 'Ranger Steve: Buffalo Invasion', 9, 18, 'normal 21px/1 ' + gameState.fontFamily, light, 'left');
    new Text(main.context, 'Click to Start', hW, hH - 70, 'normal 17px/1 ' + gameState.fontFamily, dark);
    new Text(main.context, 'Use "A" and "D" to move and "Space" to jump.', hW, hH - 30, 'normal 15px/1 ' + gameState.fontFamily, medium);
    new Text(main.context, 'Use mouse wheel to change action and left click to perform action.', hW, hH - 10, 'normal 15px/1 ' + gameState.fontFamily, medium);
    new Text(main.context, 'You can build and destroy terrain.', hW, hH + 10, 'normal 15px/1 ' + gameState.fontFamily, medium);
    new Text(main.context, 'Enemies come out at night.', hW, hH + 30, 'normal 15px/1 ' + gameState.fontFamily, medium);
}

function PlayerHandler(main) {
    this.accel = 0.3;
    this.speed = 2.5;
    this.fallSpeed = 8.0;
    this.width = 20;
    this.height = 25;
    this.startHp = 100;
    this.regen = 0.01;
    this.jumpHeight = 7.0;
    this.jumpDelay = 4.0;
    this.actions = [{
        name: 'Shotgun',
        reload: 25,
        count: 4,
        speed: 7,
        hp: 180,
        modY: 0.01,
        explode: 0,
        spread: 0.5,
        damage: 1,
        destroy: false
    }, {
        name: 'Rifle',
        reload: 6,
        count: 1,
        speed: 8,
        hp: 90,
        modY: 0.01,
        explode: 0,
        spread: 0.2,
        damage: 1,
        destroy: false
    }, {
        name: 'Grenade',
        reload: 50,
        count: 1,
        speed: 5,
        hp: 360,
        modY: 0.1,
        explode: 1,
        spread: 0.5,
        damage: 2,
        destroy: true
    }, {
        name: 'Flamer',
        reload: 1,
        count: 1,
        speed: 7,
        hp: 20,
        modY: -0.1,
        explode: 0,
        spread: 1.5,
        damage: 0.15,
        destroy: false
    }, {
        name: 'Bomb',
        reload: 85,
        count: 1,
        speed: 4.5,
        hp: 480,
        modY: 0.15,
        explode: 2,
        spread: 0.3,
        damage: 3,
        destroy: true
    }, {
        name: 'Rocket',
        reload: 90,
        count: 4,
        speed: 8,
        hp: 240,
        modY: 0,
        explode: 1,
        spread: 0.05,
        damage: 2,
        destroy: true
    }, {
        name: 'Build Dirt',
        reload: 4,
        count: -1,
        type: gameState.blockInt.dirt
    }, {
        name: 'Build Stone',
        reload: 8,
        count: -1,
        type: gameState.blockInt.stone
    }, {
        name: 'Build Wood',
        reload: 6,
        count: -1,
        type: gameState.blockInt.wood
    }, {
        name: 'Build Platform',
        reload: 6,
        count: -1,
        type: gameState.blockInt.platform
    }, {
        name: 'Remove Block',
        reload: 29,
        count: -2
    }];
    this.kills;
    this.action;
    this.actionObject;
    this.canBuild
}

PlayerHandler.prototype.init = function(main) {
    this.controlHandler = main.controlHandler;
    this.gridHandler = main.gridHandler;
    this.shoot = main.shotHandler.create.bind(main.shotHandler);
    this.viewHandler = main.viewHandler;
    this.enemyHandler = main.enemyHandler;
    this.halfWidth = gameState.canvas.width / 2;
    this.halfHeight = gameState.canvas.height / 2;
    this.x = gameState.levelWidth * gameState.blockSize * 0.5;
    this.y = this.height * 10;
    this.vX = 0;
    this.vY = 20;
    this.reload = 0;
    this.canJump = 0;
    this.inWater = false;
    this.spaceDown = false;
    this.hp = this.startHp;
    this.kills = 0;
    this.action = 0;
    this.canBuild = false;
    this.actionObject = this.actions[this.action]
};

PlayerHandler.prototype.enterFrame = function() {
    var controlHandler = this.controlHandler;
    var accel = this.accel;
    var speed = this.speed;
    var gridList = this.gridHandler.list;
    var width = this.width;
    var height = this.height;
    var i, j;
    if (this.hp < this.startHp) {
        this.hp += this.regen;
        if (this.hp > this.startHp) {
            this.hp = this.startHp
        }
    }
    if (this.canJump < 1 && controlHandler.space && this.spaceDown == false) {
        this.vY = -this.jumpHeight;
        this.spaceDown = true
    }
    if (controlHandler.space == false && this.spaceDown) {
        this.spaceDown = false
    }
    if (controlHandler.a) {
        this.vX -= accel;
        if (this.vX < -speed) {
            this.vX = -speed
        }
    } else if (controlHandler.d) {
        this.vX += accel;
        if (this.vX > speed) {
            this.vX = speed
        }
    } else if (this.vX != 0) {
        if (this.vX > 0) {
            this.vX -= accel
        } else if (this.vX < 0) {
            this.vX += accel
        }
        if (this.vX > -accel && this.vX < accel) {
            this.vX = 0
        }
    }
    var newX = this.x + this.vX;
    var startX = Math.max((newX - width * 0.5) / gameState.blockSize | 0, 0);
    var startY = Math.max((this.y - height * 0.5) / gameState.blockSize | 0, 0);
    var endX = Math.min((newX + width * 0.5 - 1) / gameState.blockSize | 0, gameState.levelWidth - 1);
    var endY = Math.min((this.y + height * 0.5) / gameState.blockSize | 0, gameState.levelHeight - 1);
    for (i = startX; i <= endX; i++) {
        for (j = startY; j <= endY; j++) {
            if (gridList[i][j] !== false && gridList[i][j] != gameState.blockInt.cloud && gridList[i][j] != gameState.blockInt.platform) {
                if (gridList[i][j] == gameState.blockInt.water) {
                    this.inWater = true;
                    if (this.vX > speed * 0.5) {
                        this.vX = speed * 0.5
                    } else if (this.vX < -speed * 0.5) {
                        this.vX = -speed * 0.5
                    }
                } else {
                    if (newX < i * gameState.blockSize) {
                        newX = i * gameState.blockSize - width * 0.5
                    } else {
                        newX = i * gameState.blockSize + gameState.blockSize + width * 0.5
                    }
                    this.vX = 0
                }
            }
        }
    }
    this.x = newX;
    if (this.inWater) {
        this.vY += 0.25;
        if (this.vY > this.fallSpeed * 0.3) {
            this.vY = this.fallSpeed * 0.3
        }
        var newY = this.y + this.vY * 0.6
    } else {
        this.vY += 0.4;
        if (this.vY > this.fallSpeed) {
            this.vY = this.fallSpeed
        }
        var newY = this.y + this.vY
    }
    var collide = false;
    this.inWater = false;
    startX = Math.max((this.x - width * 0.5) / gameState.blockSize | 0, 0);
    startY = Math.max((newY - height * 0.5) / gameState.blockSize | 0, 0);
    endX = Math.min((this.x + width * 0.5 - 1) / gameState.blockSize | 0, gameState.levelWidth - 1);
    endY = Math.min((newY + height * 0.5) / gameState.blockSize | 0, gameState.levelHeight - 1);
    for (i = startX; i <= endX; i++) {
        for (j = startY; j <= endY; j++) {
            if (gridList[i][j] !== false && gridList[i][j] != gameState.blockInt.cloud && gridList[i][j] != gameState.blockInt.platform) {
                collide = true;
                if (gridList[i][j] == gameState.blockInt.water) {
                    this.inWater = true;
                    this.canJump--
                } else {
                    if (newY < j * gameState.blockSize) {
                        newY = j * gameState.blockSize - height * 0.5 - 0.001;
                        this.canJump--
                    } else {
                        newY = j * gameState.blockSize + gameState.blockSize + height * 0.5
                    }
                    this.vY = 0
                }
            }
            if (gridList[i][j] == gameState.blockInt.platform && this.vY > 0 && controlHandler.s == false) {
                if (this.y + height * 0.5 < j * gameState.blockSize) {
                    newY = j * gameState.blockSize - height * 0.5 - 0.001;
                    collide = true;
                    this.vY = 0;
                    this.canJump--
                }
            }
        }
    }
    this.y = newY;
    if (collide == false) {
        this.canJump = this.jumpDelay
    }
    this.reload--;
    if (this.actionObject.count < 0) {
        var offsetX = this.viewHandler.x - this.halfWidth;
        var offsetY = this.viewHandler.y - this.halfHeight;
        var X = controlHandler.mouseX + offsetX;
        var Y = controlHandler.mouseY + offsetY;
        var dist = Math.sqrt((this.x - X) * (this.x - X) + (this.y - Y) * (this.y - Y));
        if (dist < 100) {
            this.canBuild = true;
            if (this.reload <= 0 && controlHandler.mouseLeft) {
                X = X / gameState.blockSize | 0;
                Y = Y / gameState.blockSize | 0;
                if (X > 0 && X < gameState.levelWidth && Y > 0 && Y < gameState.levelHeight) {
                    if (this.actionObject.count == -1) {
                        if (gridList[X][Y] == false || gridList[X][Y] == gameState.blockInt.water || gridList[X][Y] == gameState.blockInt.cloud) {
                            collide = false;
                            var enemy;
                            for (i = this.enemyHandler.list.length - 1; i >= 0; i--) {
                                enemy = this.enemyHandler.list[i];
                                if (enemy.x + enemy.width * 0.5 > X * gameState.blockSize && enemy.x - enemy.width * 0.5 < X * gameState.blockSize + gameState.blockSize & enemy.y + enemy.height * 0.5 > Y * gameState.blockSize && enemy.y - enemy.height * 0.5 < Y * gameState.blockSize + gameState.blockSize) {
                                    collide = true;
                                    break
                                }
                            }
                            if (this.x + this.width * 0.5 > X * gameState.blockSize && this.x - this.width * 0.5 < X * gameState.blockSize + gameState.blockSize & this.y + this.height * 0.5 > Y * gameState.blockSize && this.y - this.height * 0.5 < Y * gameState.blockSize + gameState.blockSize) {
                                collide = true
                            }
                            if (collide == false) {
                                gridList[X][Y] = this.actionObject.type
                            }
                        }
                    }
                    if (this.actionObject.count == -2) {
                        if (gridList[X][Y] != gameState.blockInt.bedrock) {
                            gridList[X][Y] = false
                        }
                    }
                }
                this.reload = this.actionObject.reload
            }
        } else {
            this.canBuild = false
        }
    } else {
        if (this.reload <= 0 && controlHandler.mouseLeft) {
            var offsetX = this.viewHandler.x - this.halfWidth;
            var offsetY = this.viewHandler.y - this.halfHeight;
            for (i = this.actionObject.count - 1; i >= 0; i--) {
                this.shoot(this.x, this.y - 4, controlHandler.mouseX + offsetX, controlHandler.mouseY + offsetY, this.actionObject)
            }
            this.reload = this.actionObject.reload
        }
    }
};
PlayerHandler.prototype.hotKey = function(keyCode) {
    if (keyCode == 48) {
        keyCode = 58
    }
    if (keyCode - 49 in this.actions) {
        this.action = keyCode - 49;
        this.actionObject = this.actions[this.action];
        this.reload = this.actions[this.action].reload
    }
};
PlayerHandler.prototype.wheel = function(delta) {
    if (delta > 0) {
        if (this.action <= 0) {
            this.action = this.actions.length - 1
        } else {
            this.action--
        }
    } else {
        if (this.action >= this.actions.length - 1) {
            this.action = 0
        } else {
            this.action++
        }
    }
    this.actionObject = this.actions[this.action];
    this.reload = this.actions[this.action].reload
};

function RenderHandler(main) {
    this.sunMoonArcRadius = gameState.canvas.height - 40;
    this.main = main;
    this.context = main.context;
    this.timeRatio = Math.PI * 2 / gameState.dayLength
}

RenderHandler.prototype.init = function(main) {
    this.gridHandler = main.gridHandler;
    this.controlHandler = main.controlHandler;
    this.viewHandler = main.viewHandler;
    this.shotHandler = main.shotHandler;
    this.dustHandler = main.dustHandler;
    this.bloodHandler = main.bloodHandler;
    this.enemyHandler = main.enemyHandler;
    this.player = main.playerHandler
}

RenderHandler.prototype.enterFrame = function() {
    var context = this.context;
    var gridList = this.gridHandler.list;
    var blockHalf = gameState.blockSize / 2;
    var player = this.player;
    var pX = player.x;
    var pY = player.y;
    var obj, X, Y, i, j, depth, dist;
    dist = gameState.time * this.timeRatio;
    i = Math.sin(dist);
    j = Math.cos(dist);
    var gradient = context.createLinearGradient(0, 0, 0, gameState.canvas.height);
    depth = this.viewHandler.y / (gameState.levelHeight * gameState.blockSize) * 250 | 0;
    dist = (j + 1) * 75 | 0;
    gradient.addColorStop(0, 'rgb(' + (77 + depth) + ',' + (117 + depth) + ',' + (179 + depth) + ')');
    gradient.addColorStop(1, 'rgb(' + (127 + depth - dist) + ',' + (167 + depth - dist) + ',' + (228 + depth - dist) + ')');
    context.fillStyle = gradient;
    context.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    X = gameState.canvas.width * 0.5 + i * this.sunMoonArcRadius;
    Y = gameState.canvas.height + j * this.sunMoonArcRadius;
    context.shadowBlur = 40;
    context.shadowColor = '#FEDB16';
    context.fillStyle = '#FEDB16';
    context.beginPath();
    context.arc(X, Y, 30, 0, 6.2832);
    context.fill();
    context.closePath();
    X = gameState.canvas.width * 0.5 + -i * this.sunMoonArcRadius;
    Y = gameState.canvas.height + -j * this.sunMoonArcRadius;
    context.shadowBlur = 20;
    context.shadowColor = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(X, Y, 30, 1.2, 4.3416);
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
    var offsetX = gameState.canvas.width * 0.5 - this.viewHandler.x;
    var offsetY = gameState.canvas.height * 0.5 - this.viewHandler.y;
    context.fillStyle = '#776655';
    Y = Math.round(gameState.horizon * gameState.blockSize + offsetY);
    context.fillRect(0, Y, gameState.canvas.width, gameState.canvas.height - Y);
    var startX = Math.max(-offsetX / gameState.blockSize | 0, 0);
    var endX = Math.min(startX + Math.ceil(gameState.canvas.width / gameState.blockSize) + 1, gameState.levelWidth);
    var startY = Math.max(-offsetY / gameState.blockSize | 0, 0);
    var endY = Math.min(startY + Math.ceil(gameState.canvas.height / gameState.blockSize) + 1, gameState.levelHeight);
    for (i = startX; i < endX; i++) {
        for (j = startY; j < endY; j++) {
            obj = gridList[i][j];
            if (obj !== false && obj != gameState.blockInt.water && obj != gameState.blockInt.cloud) {
                X = Math.round(i * gameState.blockSize + offsetX);
                Y = Math.round(j * gameState.blockSize + offsetY);
                context.fillStyle = gameState.blockColor[obj];
                if (obj == gameState.blockInt.platform) {
                    context.fillRect(X, Y, gameState.blockSize, gameState.blockSize * 0.25);
                    context.fillRect(X, Y + gameState.blockSize * 0.5, gameState.blockSize, gameState.blockSize * 0.25)
                } else {
                    context.fillRect(X, Y, gameState.blockSize, gameState.blockSize)
                }
            }
            if (obj === false && j == gameState.horizon && gridList[i][j - 1] === false) {
                X = Math.round(i * gameState.blockSize + offsetX);
                Y = Math.round(j * gameState.blockSize + offsetY);
                context.fillStyle = 'rbga(0,0,0,0.2)';
                context.fillRect(X + 1, Y, 2, 2);
                context.fillRect(X + 5, Y, 3, 3);
                context.fillRect(X + 11, Y, 2, 2)
            }
        }
    }


    // Draw player
    X = Math.round(pX + offsetX - player.width / 2);
    Y = Math.round(pY + offsetY - player.height / 2);
    context.shadowBlur = 5;
    context.shadowOffsetX = -player.vX;
    context.shadowOffsetY = -player.vY;
    context.shadowColor = 'rgba(0,0,0,0.1)';
    context.fillStyle = '#333333';
    context.fillRect(X, Y, player.width, player.height);

    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.fillStyle = '#774444';








    for (i = this.enemyHandler.list.length - 1; i >= 0; i--) {
        obj = this.enemyHandler.list[i];
        context.fillRect(Math.round(obj.x + offsetX - obj.width * 0.5), Math.round(obj.y + offsetY - obj.height * 0.5), obj.width, obj.height)
    }
    context.fillStyle = '#333333';
    for (i = this.shotHandler.list.length - 1; i >= 0; i--) {
        obj = this.shotHandler.list[i];
        dist = this.shotHandler.size;
        context.fillRect(Math.round(obj.x + offsetX - dist / 2), Math.round(obj.y + offsetY - dist / 2), dist, dist)
    }
    context.fillStyle = '#555555';
    for (i = this.dustHandler.list.length - 1; i >= 0; i--) {
        obj = this.dustHandler.list[i];
        dist = this.dustHandler.size * (obj.hp / this.dustHandler.startHp);
        context.fillRect(Math.round(obj.x + offsetX - dist * 0.5), Math.round(obj.y + offsetY - dist * 0.5), dist, dist)
    }
    context.fillStyle = '#AA4444';
    for (i = this.bloodHandler.list.length - 1; i >= 0; i--) {
        obj = this.bloodHandler.list[i];
        dist = this.bloodHandler.size * (obj.hp / this.bloodHandler.startHp);
        context.fillRect(Math.round(obj.x + offsetX - dist * 0.5), Math.round(obj.y + offsetY - dist * 0.5), dist, dist)
    }
    for (i = startX; i < endX; i++) {
        for (j = startY; j < endY; j++) {
            obj = gridList[i][j];
            if (obj == gameState.blockInt.dirt && j <= gameState.horizon && (gridList[i][j - 1] === false || gridList[i][j - 1] == gameState.blockInt.cloud)) {
                X = Math.round(i * gameState.blockSize + offsetX);
                Y = Math.round(j * gameState.blockSize + offsetY);
                context.fillStyle = 'rgba(45,130,45,0.75)';
                context.fillRect(X, Y - 3, gameState.blockSize, 3);
                context.fillRect(X + 1, Y - 5, 2, 2);
                context.fillRect(X + 5, Y - 5, 3, 2);
                context.fillRect(X + 11, Y - 5, 2, 2)
            }
            if (obj == gameState.blockInt.water || obj == gameState.blockInt.cloud) {
                X = Math.round(i * gameState.blockSize + offsetX);
                Y = Math.round(j * gameState.blockSize + offsetY);
                context.fillStyle = gameState.blockColor[obj];
                context.fillRect(X, Y, gameState.blockSize, gameState.blockSize)
            }
            if (obj == gameState.blockInt.water && j <= gameState.horizon && (gridList[i][j - 1] === false || gridList[i][j - 1] == gameState.blockInt.cloud)) {
                context.fillStyle = 'rgba(255,255,255,0.2)';
                context.fillRect(X, Y, gameState.blockSize, 6);
                context.fillRect(X, Y, gameState.blockSize / 2, 3)
            }
        }
    }

    for (i = startX; i < endX; i++) {
        depth = 0;
        for (j = 0; j < endY; j++) {
            obj = gridList[i][j];
            if (obj != gameState.blockInt.bedrock && obj != gameState.blockInt.cloud && obj != false || j >= gameState.horizon) {
                X = i * gameState.blockSize;
                Y = j * gameState.blockSize;
                dist = (pX - X - blockHalf) * (pX - X - blockHalf) + (pY - Y - blockHalf) * (pY - Y - blockHalf);
                X = Math.round(X + offsetX);
                Y = Math.round(Y + offsetY);
                context.fillStyle = 'rgba(0,0,0,' + (depth * 0.05 * Math.max(Math.min(dist / 16000, 1), 0.4)) + ')';
                context.fillRect(X, Y, gameState.blockSize, gameState.blockSize);
                if (obj == gameState.blockInt.platform) {
                    depth += 0.2
                } else if (obj == gameState.blockInt.water) {
                    depth += 0.5
                } else {
                    depth += 1
                }
            }
        }
    }

    depth = Math.min(Math.cos(gameState.time * this.timeRatio) + 0.3, 0.5);
    if (depth > 0) {
        context.fillStyle = 'rgba(0,0,0,' + depth + ')';
        context.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)
    }
    if (player.actionObject.count < 0 && player.canBuild) {
        context.fillStyle = 'rgba(0,0,0,0.2)';
        context.fillRect(((this.controlHandler.mouseX - offsetX) / gameState.blockSize | 0) * gameState.blockSize + offsetX, ((this.controlHandler.mouseY - offsetY) / gameState.blockSize | 0) * gameState.blockSize + offsetY, gameState.blockSize, gameState.blockSize)
    }

    context.fillStyle = '#444444';
    context.fillRect(0, 0, gameState.canvas.width, 20);
    context.textAlign = 'left';
    context.font = 'bold 11px/1 Arial';
    context.fillStyle = '#AAAAAA';
    context.fillText('H', 5, 10);
    context.fillText('K', 85, 10);
    context.font = 'bold 15px/1 Arial';
    context.fillStyle = '#DDDDDD';
    context.fillText(Math.round(player.hp), 15, 10);
    context.fillText(Math.round(player.kills), 95, 10);
    context.textAlign = 'right';
    context.fillText(player.actions[player.action].name, gameState.canvas.width - 5, 10)
}

function ShotHandler(main) {
    this.size = 5;
    this.actions = [false, {
        name: 'Explode1',
        count: 30,
        speed: 4,
        hp: 15,
        modY: 0,
        explode: 0,
        spread: 0,
        damage: 1,
        destroy: false
    }, {
        name: 'Explode2',
        count: 30,
        speed: 4,
        hp: 15,
        modY: 0,
        explode: 0,
        spread: 0,
        damage: 2,
        destroy: true
    }];
    this.list = [];
    this.pool = []
}

ShotHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.gridList = main.gridHandler.list;
    this.enemyHandler = main.enemyHandler;
    this.dust = main.dustHandler.create.bind(main.dustHandler);
    this.blood = main.bloodHandler.create.bind(main.bloodHandler);
}

ShotHandler.prototype.enterFrame = function() {
    var gridList = this.gridList;
    var shot, enemy, j, X, Y;
    for (var i = this.list.length - 1; i >= 0; i--) {
        shot = this.list[i];
        shot.x += shot.vX;
        shot.y += shot.vY;
        shot.vY += shot.modY;
        shot.hp--;
        X = shot.x / gameState.blockSize | 0;
        Y = shot.y / gameState.blockSize | 0;
        if (X >= 0 && X < gameState.levelWidth && Y >= 0 && Y < gameState.levelHeight) {
            if (gridList[X][Y] == gameState.blockInt.water) {
                shot.x -= shot.vX * 0.5;
                shot.y -= shot.vY * 0.5
            } else if (gridList[X][Y] !== false && gridList[X][Y] != gameState.blockInt.cloud && gridList[X][Y] != gameState.blockInt.platform) {
                if (shot.destroy && gridList[X][Y] != gameState.blockInt.bedrock) {
                    gridList[X][Y] = false
                }
                shot.hp = -99;
                this.dust(shot.x - shot.vX, shot.y - shot.vY, shot.vX * 0.2, shot.vY * 0.2, 4)
            }
        }

        for (j = this.enemyHandler.list.length - 1; j >= 0; j--) {
            enemy = this.enemyHandler.list[j];
            if (shot.x + 2 > enemy.x - enemy.width * 0.5 && shot.x - 2 < enemy.x + enemy.width * 0.5 && shot.y + 2 > enemy.y - enemy.height * 0.5 && shot.y - 2 < enemy.y + enemy.height * 0.5) {
                enemy.hp -= shot.damage;
                enemy.vX = shot.vX * 0.03;
                enemy.vY = shot.vY * 0.03;
                shot.hp = -99;
                this.blood(shot.x, shot.y, shot.vX * 0.4, shot.vY * 0.4, 4)
            }
        }

        if (shot.hp == -99 && shot.explode > 0) {
            for (j = this.actions[shot.explode].count - 1; j >= 0; j--) {
                this.create(shot.x, shot.y, shot.x + Math.random() * 10 - 5, shot.y + Math.random() * 10 - 5, this.actions[shot.explode])
            }
        }

        if (shot.hp <= 0) {
            this.pool[this.pool.length] = shot;
            this.list.splice(i, 1);
            continue
        }
    }
}

ShotHandler.prototype.create = function(sX, sY, eX, eY, action) {
    if (this.pool.length > 0) {
        var shot = this.pool.pop()
    } else {
        var shot = new Object()
    }

    shot.x = sX;
    shot.y = sY;
    shot.vX = eX - sX;
    shot.vY = eY - sY;
    var dist = Math.sqrt(shot.vX * shot.vX + shot.vY * shot.vY);
    shot.vX = shot.vX / dist * action.speed + Math.random() * action.spread * 2 - action.spread;
    shot.vY = shot.vY / dist * action.speed + Math.random() * action.spread * 2 - action.spread;
    shot.modY = action.modY;
    shot.hp = action.hp;
    shot.explode = action.explode;
    shot.damage = action.damage;
    shot.destroy = action.destroy;
    this.list[this.list.length] = shot
}

function Text(context, text, x, y, font, style, align, baseline) {
    context.font = typeof font === 'undefined' ? 'normal 16px/1 Arial' : font;
    context.fillStyle = typeof style === 'undefined' ? '#000000' : style;
    context.textAlign = typeof align === 'undefined' ? 'center' : align;
    context.textBaseline = typeof baseline === 'undefined' ? 'middle' : baseline;
    context.fillText(text, x, y)
}

function ViewHandler(main) {
    this.x;
    this.y
}

ViewHandler.prototype.init = function(main) {
    this.x = gameState.levelWidth * gameState.blockSize * 0.5;
    this.y = 300;
    this.player = main.playerHandler;
}

ViewHandler.prototype.enterFrame = function() {
    this.x += (this.player.x - this.x) * 0.05;
    if (this.x < this.player.x + 1 && this.x > this.player.x - 1) {
        this.x = this.player.x
    }

    this.y += (this.player.y - this.y) * 0.05;
    if (this.y < this.player.y + 1 && this.y > this.player.y - 1) {
        this.y = this.player.y
    }

    if (this.x < gameState.canvas.width * 0.5) {
        this.x = gameState.canvas.width * 0.5
    } else if (this.x > gameState.levelWidth * gameState.blockSize - gameState.canvas.width * 0.5) {
        this.x = gameState.levelWidth * gameState.blockSize - gameState.canvas.width * 0.5
    }

    if (this.y < gameState.canvas.height * 0.5) {
        this.y = gameState.canvas.height * 0.5
    } else if (this.y > gameState.levelHeight * gameState.blockSize - gameState.canvas.height * 0.5) {
        this.y = gameState.levelHeight * gameState.blockSize - gameState.canvas.height * 0.5
    }
}
