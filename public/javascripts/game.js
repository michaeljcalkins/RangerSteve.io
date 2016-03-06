var gameWidth = "100%"
var gameHeight = "100%"
var worldWidth = 4000
var worldHeight = 3000

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'ranger-steve-game');

var RangerSteveGame = function() {
    this.player
    this.platforms
    this.ground

    this.score = 0
    this.scoreText

    this.weapons = [];
    this.currentWeapon = 0;
    this.weaponName = null;
}

RangerSteveGame.prototype = {
    init: function() {
        this.game.renderer.renderSession.roundPixels = true
        this.physics.startSystem(Phaser.Physics.ARCADE)
    },

    preload: function() {
        this.load.image('bullet11', '/images/bullet11.png')
        this.load.image('bullet10', '/images/bullet10.png')
        this.load.image('bullet9', '/images/bullet9.png')
        this.load.image('bullet8', '/images/bullet8.png')
        this.load.image('bullet7', '/images/bullet7.png')
        this.load.image('bullet5', '/images/bullet5.png')
        this.load.image('bullet4', '/images/bullet4.png')
        this.load.image('treescape', '/images/treescape.jpg')
        this.load.image('ground', '/images/platform.png')
        this.load.spritesheet('dude', '/images/dude.png', 32, 48)
    },

    create: function() {
        this.world.setBounds(0, 0, worldWidth, worldHeight)

        //  We're going to be using physics, so enable the Arcade Physics system
        this.physics.startSystem(Phaser.Physics.ARCADE)

        game.stage.backgroundColor = "#D3EBF9";

        // Scale game on window resize
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.setShowAll();

        window.addEventListener('resize', function () {
            this.game.scale.refresh()
        })

        this.game.scale.refresh()

        /**
         * Weapons
         */
        this.currentWeapon = 0;

        for (var i = 1; i < this.weapons.length; i++)
        {
            this.weapons[i].visible = false;
        }


        //  A simple background for our game
        var skySprite = this.add.tileSprite(0, this.game.world.height - 566, this.game.world.width, 600, 'treescape')

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.add.group()

        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true


        /**
         * Platforms
         */
        var leftPlayerStartingLedge = this.platforms.create(0, this.game.world.height - 100, 'ground');
        leftPlayerStartingLedge.height = 300
        leftPlayerStartingLedge.width = 1000

        var mainCenterLedge = this.platforms.create(1000, this.game.world.height - 200, 'ground');
        mainCenterLedge.height = 400
        mainCenterLedge.width = 2000

        var rightPlayerStartingLedge = this.platforms.create(this.game.world.width - 1000, this.game.world.height - 100, 'ground');
        rightPlayerStartingLedge.height = 300
        rightPlayerStartingLedge.width = 1000

        this.platforms.setAll('body.immovable', true);


        /**
         * Player Settings
         */
        this.player = this.add.sprite(32, this.world.height - 400, 'dude');

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
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })
        this.weaponName = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })


        /**
         * Weapons
         */
        this.weapons.push(new Weapon.Ak47(this.game));
        this.weapons.push(new Weapon.ScatterShot(this.game));
        this.weapons.push(new Weapon.Beam(this.game));
        this.weapons.push(new Weapon.SplitShot(this.game));
        this.weapons.push(new Weapon.Pattern(this.game));
        this.weapons.push(new Weapon.Rockets(this.game));
        this.weapons.push(new Weapon.ScaleBullet(this.game));


        /**
         * Control Settings
         */
        // cursors = this.input.keyboard.createCursorKeys();
        this.upButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.downButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);

        /**
         * Camera Settings
         */
        this.camera.follow(this.player);

        var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        changeKey.onDown.add(this.nextWeapon, this);
    },

    update: function() {
        //  Collide the player and the stars with the platforms
        this.physics.arcade.collide(this.player, this.platforms);
        this.physics.arcade.collide(this.platforms, this.weapons, function(platform, weapon) {
            weapon.kill()
        }, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.leftButton.isDown)
        {
            //  Move to the left
            this.player.body.velocity.x = -300;

            this.player.animations.play('left');
        }
        else if (this.rightButton.isDown)
        {
            //  Move to the right
            this.player.body.velocity.x = 300;

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

        if (this.game.input.activePointer.isDown)
        {
            this.weapons[this.currentWeapon].fire(this.player);
        }
    },

    render: function() {
        this.game.debug.cameraInfo(this.camera, 32, 32);
    },

    nextWeapon: function () {

        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset();
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;

        this.weaponName.text = this.weapons[this.currentWeapon].name;
    },
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

    gx = gx || 0
    gy = gy || 0
    this.reset(x, y);
    this.scale.set(1);

    game.physics.arcade.moveToPointer(this, speed);
}

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
}

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

/**
 * Primary Weapons
 * 1. Desert Eagles
 * 2. HK MP5
 * 3. AK47
 * 4. M16
 * 5. Spas-12
 * 6. Ruger 77
 * 7. M79
 * 8. Barret M82A1
 * 9. FN Minimi
 * 10. XM214 Minigun
 */

/**
 * Secondary Weapons
 * 1. USSOCOM
 * 2. Combat Knife
 * 3. Chainsaw
 * 4. M72 Law
 */

Weapon.Ak47 = function (game) {

    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1300;
    this.fireRate = 100;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet5'), true);
    }

    return this;

};

Weapon.Ak47.prototype = Object.create(Phaser.Group.prototype);
Weapon.Ak47.prototype.constructor = Weapon.Ak47;

Weapon.Ak47.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire)
        return

    var x = source.x + 22;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
}


////////////////////////////////////////////////////
//  Bullets are fired out scattered on the y axis //
////////////////////////////////////////////////////

Weapon.ScatterShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scatter Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet5'), true);
    }

    return this;

};

Weapon.ScatterShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScatterShot.prototype.constructor = Weapon.ScatterShot;

Weapon.ScatterShot.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 16;
    var y = (source.y + source.height / 2) + this.game.rnd.between(-10, 10);

    var bulletInstance = this.getFirstExists(false)

    if (!bulletInstance) return

    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

//////////////////////////////////////////////////////////////////////////
//  Fires a streaming beam of lazers, very fast, in front of the player //
//////////////////////////////////////////////////////////////////////////

Weapon.Beam = function (game) {

    Phaser.Group.call(this, game, game.world, 'Beam', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1000;
    this.fireRate = 45;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet11'), true);
    }

    return this;

};

Weapon.Beam.prototype = Object.create(Phaser.Group.prototype);
Weapon.Beam.prototype.constructor = Weapon.Beam;

Weapon.Beam.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 40;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

///////////////////////////////////////////////////////////////////////
//  A three-way fire where the top and bottom bullets bend on a path //
///////////////////////////////////////////////////////////////////////

Weapon.SplitShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Split Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 700;
    this.fireRate = 40;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet8'), true);
    }

    return this;

};

Weapon.SplitShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.SplitShot.prototype.constructor = Weapon.SplitShot;

Weapon.SplitShot.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 20
    var y = source.y + 10

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -500)
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0)
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 500)

    this.nextFire = this.game.time.time + this.fireRate;
}

///////////////////////////////////////////////////////////////////////
//  Bullets have Gravity.y set on a repeating pre-calculated pattern //
///////////////////////////////////////////////////////////////////////

Weapon.Pattern = function (game) {

    Phaser.Group.call(this, game, game.world, 'Pattern', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200);
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200));

    this.patternIndex = 0;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet4'), true);
    }

    return this;

};

Weapon.Pattern.prototype = Object.create(Phaser.Group.prototype);
Weapon.Pattern.prototype.constructor = Weapon.Pattern;

Weapon.Pattern.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 20;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, this.pattern[this.patternIndex]);

    this.patternIndex++;

    if (this.patternIndex === this.pattern.length)
    {
        this.patternIndex = 0;
    }

    this.nextFire = this.game.time.time + this.fireRate;

};

///////////////////////////////////////////////////////////////////
//  Rockets that visually track the direction they're heading in //
///////////////////////////////////////////////////////////////////

Weapon.Rockets = function (game) {

    Phaser.Group.call(this, game, game.world, 'Rockets', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 400;
    this.fireRate = 250;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet10'), true);
    }

    this.setAll('tracking', true)

    return this;

};

Weapon.Rockets.prototype = Object.create(Phaser.Group.prototype);
Weapon.Rockets.prototype.constructor = Weapon.Rockets;

Weapon.Rockets.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);

    this.nextFire = this.game.time.time + this.fireRate;

};

////////////////////////////////////////////////////////////////////////
//  A single bullet that scales in size as it moves across the screen //
////////////////////////////////////////////////////////////////////////

Weapon.ScaleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scale Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 800;
    this.fireRate = 100;

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

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;
}

game.state.add('Game', RangerSteveGame, true);
