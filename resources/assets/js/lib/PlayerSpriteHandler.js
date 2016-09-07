import GameConsts from './GameConsts'
import Maps from './Maps'
import actions from '../actions'

export default function PlayerSpriteHandler() {
    const state = this.game.store.getState()
    const spawnPoint = Maps[state.room.map].getRandomSpawnPoint()
    const primaryWeaponId = this.game.store.getState().player.selectedPrimaryWeaponId
    const selectedPrimaryWeapon = GameConsts.WEAPONS[primaryWeaponId]
    const secondaryWeaponId = this.game.store.getState().player.selectedSecondaryWeaponId
    const selectedSecondaryWeapon = GameConsts.WEAPONS[secondaryWeaponId]

    this.player = this.add.sprite(spawnPoint.x, spawnPoint.y, 'commando')
    this.player.width = GameConsts.PLAYER_SPRITE_WIDTH
    this.player.height = GameConsts.PLAYER_SPRITE_HEIGHT
    // this.player.scale.setTo(GameConsts.PLAYER_SCALE)
    this.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player)
    this.player.body.setSize(GameConsts.PLAYER_BODY_WIDTH, GameConsts.PLAYER_BODY_HEIGHT, 105, 10)
    this.game.slopes.enable(this.player)

    // Add a touch of tile padding for the collision detection
    this.player.body.tilePadding.x = 10
    this.player.body.tilePadding.y = 10

    this.player.body.slopes.friction.x = GameConsts.PLAYER_SLOPE_FRICTION_X
    this.player.body.slopes.friction.y = GameConsts.PLAYER_SLOPE_FRICTION_Y

    // Set player minimum and maximum movement speed
    this.player.body.maxVelocity.x = GameConsts.MAX_VELOCITY_X
    this.player.body.maxVelocity.y = GameConsts.MAX_VELOCITY_Y

    // Add drag to the player that slows them down when they are not accelerating
    this.player.body.drag.x = GameConsts.DRAG
    this.player.body.drag.y = 0

    // Make player collide with world boundaries so he doesn't leave the stage
    this.player.body.collideWorldBounds = true

    //  Our two animations, walking left and right.
    this.player.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    this.player.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)
    this.player.animations.add('death', GameConsts.ANIMATION_DEATH, 20, false)

    this.game.store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[primaryWeaponId]))
    this.game.store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[secondaryWeaponId]))

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
    this.leftArmSprite.rotation = 80.16
    this.leftArmGroup.add(this.leftArmSprite)

    // Gun
    this.currentWeaponSprite = this.game.add.sprite(
        selectedPrimaryWeapon.position.spriteX,
        selectedPrimaryWeapon.position.spriteY,
        selectedPrimaryWeapon.id
    )
    this.currentWeaponSprite.scale.setTo(selectedPrimaryWeapon.position.scale)
    this.currentWeaponSprite.rotation = selectedPrimaryWeapon.position.rotation

    this.game.store.dispatch(actions.player.setPrimaryAmmoRemaining(selectedPrimaryWeapon.ammo))
    this.game.store.dispatch(actions.player.setSecondaryAmmoRemaining(selectedSecondaryWeapon.ammo))

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

    this.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    this.leftJumpjet.anchor.setTo(0)
    this.leftJumpjet.scale.setTo(.4)
    this.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    this.leftJumpjet.animations.play('thrust')
    this.leftJumpjet.y = 130
    this.leftJumpjet.x = -78
    this.leftJumpjet.visible = false
    this.player.addChild(this.leftJumpjet)

    this.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    this.rightJumpjet.anchor.setTo(0)
    this.rightJumpjet.scale.setTo(.4)
    this.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    this.rightJumpjet.animations.play('thrust')
    this.rightJumpjet.y = 130
    this.rightJumpjet.x = -7
    this.rightJumpjet.visible = false
    this.player.addChild(this.rightJumpjet)

    this.player.anchor.set(.5)

    /**
     * Camera Settings
     */
    this.camera.follow(this.player)
    this.camera.lerp.setTo(0.2, 0.2)
}
