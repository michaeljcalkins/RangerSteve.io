import store from 'store'
import GameConsts from './GameConsts'
import Weapons from './Weapons'
import Maps from './Maps'
import actions from '../actions'

export default function PlayerSpriteHandler() {
    const state = this.game.store.getState()
    const spawnPoint = Maps[state.room.map].getRandomSpawnPoint()

    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando')
    this.player.scale.setTo(GameConsts.PLAYER_SCALE)
    this.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    this.player.height = 91
    this.player.width = 94

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player)

    // Enable physics on the player
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE)

    // Make player collide with world boundaries so he doesn't leave the stage
    this.player.body.collideWorldBounds = true

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.setTo(GameConsts.MAX_SPEED, GameConsts.MAX_SPEED * 10) // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.player.body.drag.setTo(GameConsts.DRAG, 0) // x, y
    this.player.body.setSize(145, 295, 26, 0)

    //  Our two animations, walking left and right.
    this.player.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    this.player.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)
    this.player.animations.add('death', GameConsts.ANIMATION_DEATH, 20, false)

    this.game.store.dispatch(actions.player.setPrimaryWeapon(new Weapons[this.game.store.getState().player.selectedPrimaryWeaponId](this)))
    this.game.store.dispatch(actions.player.setSecondaryWeapon(new Weapons[this.game.store.getState().player.selectedSecondaryWeaponId](this)))

    this.leftArmGroup = this.game.add.group()
    this.rightArmGroup = this.game.add.group()
    this.headGroup = this.game.add.group()
    this.torsoGroup = this.game.add.group()

    // Torso
    this.torsoSprite = this.game.add.sprite(-37, -105, 'torso')
    this.torsoSprite.scale.setTo(1.8)
    this.torsoGroup.add(this.torsoSprite)

    // Head
    this.headSprite = this.game.add.sprite(0, -148, 'head')
    this.headSprite.scale.setTo(1.8)
    this.headGroup.add(this.headSprite)

    // Left arm
    this.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    this.leftArmSprite.anchor.setTo(.2, .2)
    this.leftArmSprite.scale.setTo(1.6)
    this.leftArmSprite.rotation = 80.1
    this.leftArmGroup.add(this.leftArmSprite)

    // Gun
    this.currentWeaponSprite = this.game.add.sprite(
        this.game.store.getState().player.primaryWeapon.meta.spriteX,
        this.game.store.getState().player.primaryWeapon.meta.spriteY,
        this.game.store.getState().player.selectedPrimaryWeaponId
    )
    this.currentWeaponSprite.scale.setTo(this.game.store.getState().player.primaryWeapon.meta.scale)
    this.currentWeaponSprite.rotation = this.game.store.getState().player.primaryWeapon.meta.rotation

    // Right arm
    this.rightArmGroup.add(this.currentWeaponSprite)
    this.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm')
    this.rightArmSprite.anchor.setTo(.2, .24)
    this.rightArmSprite.scale.setTo(1.7)
    this.rightArmSprite.rotation = 80.1
    this.rightArmGroup.add(this.rightArmSprite)

    this.player.addChild(this.leftArmGroup)
    this.leftArmGroup.pivot.x = 0
    this.leftArmGroup.pivot.y = 0
    this.leftArmGroup.x = 45
    this.leftArmGroup.y = -70

    this.player.addChild(this.torsoGroup)
    this.player.addChild(this.headGroup)

    this.player.addChild(this.rightArmGroup)
    this.rightArmGroup.pivot.x = 0
    this.rightArmGroup.pivot.y = 0
    this.rightArmGroup.x = -25
    this.rightArmGroup.y = -65

    this.muzzleFlash = this.game.make.sprite(0, 0, 'muzzle-flash')
    this.muzzleFlash.scale.setTo(.6)
    this.muzzleFlash.animations.add('flash', [0,1,2,3,4,5], 20, true)
    this.muzzleFlash.animations.play('flash')
    this.muzzleFlash.y = -72
    this.muzzleFlash.x = 102
    this.muzzleFlash.visible = false
    this.currentWeaponSprite.addChild(this.muzzleFlash)
    this.player.anchor.set(.5)


    /**
     * Camera Settings
     */
    this.camera.follow(this.player)
}
