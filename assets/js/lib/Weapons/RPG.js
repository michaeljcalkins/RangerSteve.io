
///////////////////////////////////////////////////////////////////
//  RPG that visually track the direction they're heading in //
///////////////////////////////////////////////////////////////////

Weapon.RPG = function (game) {

    Phaser.Group.call(this, game, game.world, 'RPG', false, true, Phaser.Physics.ARCADE);

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

Weapon.RPG.prototype = Object.create(Phaser.Group.prototype);
Weapon.RPG.prototype.constructor = Weapon.RPG;

Weapon.RPG.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 10;
    var y = source.y + 10;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);

    this.nextFire = this.game.time.time + this.fireRate;

};
