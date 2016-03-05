var gameWidth = 800
var gameHeight = 600

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game');

var RangerSteveGame = function() {
    this.player
    this.platforms
    this.ground

    this.score = 0
    this.scoreText
}

RangerSteveGame.prototype = {
    init: function() {
        this.game.renderer.renderSession.roundPixels = true
        this.physics.startSystem(Phaser.Physics.ARCADE)
    },

    preload: function() {
        this.load.image('treescape', '/images/treescape.jpg');
        this.load.image('ground', '/images/platform.png');
        this.load.spritesheet('dude', '/images/dude.png', 32, 48);
    },

    create: function() {
        this.weapon1 = new Weapon.SingleBullet(this.game);
        this.weapon2 = new Weapon.Rockets(this.game);
        this.weapon3 = new Weapon.ScaleBullet(this.game);

        this.world.setBounds(0, 0, 1920, 1920);

        this.game.canvas.style.cursor = "crosshair"

        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        var skySprite = this.add.sprite(0, 1320, 'treescape');
        skySprite.width = 800
        skySprite.height = 600

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.add.group();

        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;


        /**
         * Ground
         */
        this.ground = this.platforms.create(0, 1919, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.ground.width = 1920;

        //  This stops it from falling away when you jump on it
        this.ground.body.immovable = true;

        /**
         * Platforms
         */

        //  Now let's create two ledges
        this.platforms.create(400, 400, 'ground');
        this.platforms.create(-150, 250, 'ground');
        this.platforms.setAll('body.immovable', true);

        /**
         * Player Settings
         */
        this.player = this.add.sprite(32, this.world.height - 150, 'dude');

        //  We need to enable physics on the player
        this.physics.arcade.enable(this.player);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 1100;
        this.player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        //  The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        /**
         * Control Settings
         */

        //  Our controls.
        // cursors = this.input.keyboard.createCursorKeys();
        this.upButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.downButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);

        /**
         * Camera Settings
         */
        this.camera.follow(this.player);
    },

    update: function() {

        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.leftButton.isDown)
        {
            //  Move to the left
            this.player.body.velocity.x = -250;

            this.player.animations.play('left');
        }
        else if (this.rightButton.isDown)
        {
            //  Move to the right
            this.player.body.velocity.x = 250;

            this.player.animations.play('right');
        }
        else
        {
            //  Stand still
            this.player.animations.stop();

            this.player.frame = 4;
        }

        //  Allow the player to jump if they are touching the ground.
        if (this.upButton.isDown && this.player.body.touching.down)
        {
            this.player.body.velocity.y = -550;
        }

    },

    render: function() {
        this.game.debug.cameraInfo(this.camera, 32, 32);
    },


    fireBullet: function () {
        this.weapon1.fire(this.player);
    },

    fireRocket: function () {
        this.weapon2.fire(this.player);
    },

    fireSpreadShot: function () {
        this.weapon3.fire(this.player);
    }
}


var Bullet = function (game, key) {
    Phaser.Sprite.call(this, game, 0, 0, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;

};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {

    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;

    this.body.gravity.set(gx, gy);

};

Bullet.prototype.update = function () {

    if (this.tracking)
    {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0)
    {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }

};

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

Weapon.SingleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 100;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet2'), true);
    }

    return this;

};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleBullet.prototype.fire = function (source) {

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

};

///////////////////////////////////////////////////////////////////
//  Rockets that visually track the direction they're heading in //
///////////////////////////////////////////////////////////////////

Weapon.Rockets = function (game) {

    Phaser.Group.call(this, game, game.world, 'Rockets', false, true, Phaser.Physics.ARCADE);

    this.bulletSpeed = 400;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet10'), true);
    }

    this.setAll('tracking', true);

    return this;

};

Weapon.Rockets.prototype = Object.create(Phaser.Group.prototype);
Weapon.Rockets.prototype.constructor = Weapon.Rockets;

Weapon.Rockets.prototype.fire = function (source) {

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);

};

////////////////////////////////////////////////////////////////////////
//  A single bullet that scales in size as it moves across the screen //
////////////////////////////////////////////////////////////////////////

Weapon.ScaleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scale Bullet', false, true, Phaser.Physics.ARCADE);

    this.bulletSpeed = 800;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet9'), true);
    }

    this.setAll('scaleSpeed', 0.05);

    return this;

};

Weapon.ScaleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScaleBullet.prototype.constructor = Weapon.ScaleBullet;

Weapon.ScaleBullet.prototype.fire = function (source) {

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

};

game.state.add('Game', RangerSteveGame, true);
