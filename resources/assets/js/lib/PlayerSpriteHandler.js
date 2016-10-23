import GameConsts from './GameConsts'
import Maps from './Maps'
import actions from '../actions'
import GetSpawnPoint from './GetSpawnPoint'

export default function PlayerSpriteHandler() {
    const state = this.game.store.getState()

    const spawnPoints = Maps[state.room.map].getSpawnPoints()
    const spawnPoint = GetSpawnPoint(spawnPoints, RangerSteve.enemies.children)

    const primaryWeaponId = this.game.store.getState().player.selectedPrimaryWeaponId
    const selectedPrimaryWeapon = GameConsts.WEAPONS[primaryWeaponId]
    const secondaryWeaponId = this.game.store.getState().player.selectedSecondaryWeaponId
    const selectedSecondaryWeapon = GameConsts.WEAPONS[secondaryWeaponId]

    this.game.store.dispatch(actions.player.setPrimaryAmmoRemaining(selectedPrimaryWeapon.ammo))
    this.game.store.dispatch(actions.player.setSecondaryAmmoRemaining(selectedSecondaryWeapon.ammo))

    RangerSteve.playerGroup = this.game.add.group()
    RangerSteve.leftArmGroup = this.game.add.group()
    RangerSteve.rightArmGroup = this.game.add.group()

    // Player sprite
    RangerSteve.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, 'player-placeholder')
    RangerSteve.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

    // Physics
    this.game.physics.arcade.enable(RangerSteve.player)
    this.game.slopes.enable(RangerSteve.player)
    this.game.physics.arcade.gravity.y = GameConsts.SLOPE_FEATURES.gravity

    // Add a touch of tile padding for the collision detection
    RangerSteve.player.body.tilePadding.x = 1
    RangerSteve.player.body.tilePadding.y = 1

    // Set player minimum and maximum movement speed
    RangerSteve.player.body.maxVelocity.x = GameConsts.MAX_VELOCITY_X
    RangerSteve.player.body.maxVelocity.y = GameConsts.MAX_VELOCITY_Y

    // Add drag to the player that slows them down when they are not accelerating
    RangerSteve.player.body.drag.x = GameConsts.SLOPE_FEATURES.dragX
    RangerSteve.player.body.drag.y = GameConsts.SLOPE_FEATURES.dragY

    // Update player body Arcade Slopes properties
    RangerSteve.player.body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
    RangerSteve.player.body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
    RangerSteve.player.body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY

    // Make player collide with world boundaries so he doesn't leave the stage
    RangerSteve.player.body.collideWorldBounds = true

    // Left jump jet
    RangerSteve.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    RangerSteve.leftJumpjet.anchor.setTo(0)
    RangerSteve.leftJumpjet.scale.setTo(0.07)
    RangerSteve.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    RangerSteve.leftJumpjet.animations.play('thrust')
    RangerSteve.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
    RangerSteve.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
    RangerSteve.leftJumpjet.visible = false
    RangerSteve.player.addChild(RangerSteve.leftJumpjet)

    // Right jump jet
    RangerSteve.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    RangerSteve.rightJumpjet.anchor.setTo(0)
    RangerSteve.rightJumpjet.scale.setTo(0.07)
    RangerSteve.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    RangerSteve.rightJumpjet.animations.play('thrust')
    RangerSteve.rightJumpjet.y = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_X
    RangerSteve.rightJumpjet.x = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_Y
    RangerSteve.rightJumpjet.visible = false
    RangerSteve.player.addChild(RangerSteve.rightJumpjet)

    // Player sprite
    RangerSteve.playerSprite = this.game.add.sprite(0, 0, 'player')
    RangerSteve.playerSprite.anchor.setTo(.5)

    //  Our two animations, walking left and right.
    RangerSteve.playerSprite.animations.add('runRight-faceRight', [0,1,2,3,4,5], GameConsts.ANIMATION_FRAMERATE, true)
    RangerSteve.playerSprite.animations.add('runLeft-faceLeft', [7,8,9,10,11,12], GameConsts.ANIMATION_FRAMERATE, true)
    RangerSteve.playerSprite.animations.add('runRight-faceLeft', [14,15,16,17,18,19], GameConsts.ANIMATION_FRAMERATE, true)
    RangerSteve.playerSprite.animations.add('runLeft-faceRight', [21,22,23,24,25,26], GameConsts.ANIMATION_FRAMERATE, true)

    this.game.store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[primaryWeaponId]))
    this.game.store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[secondaryWeaponId]))

    // Left arm
    RangerSteve.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    RangerSteve.leftArmSprite.anchor.setTo(0.8, .2)
    RangerSteve.leftArmSprite.scale.setTo(0.37)
    RangerSteve.leftArmSprite.rotation = 83
    RangerSteve.leftArmSprite.scale.y *= -1
    RangerSteve.leftArmGroup.add(RangerSteve.leftArmSprite)

    // Add left arm to player as child then offset it
    RangerSteve.player.addChild(RangerSteve.leftArmGroup)
    RangerSteve.leftArmGroup.pivot.x = 0
    RangerSteve.leftArmGroup.pivot.y = 0
    RangerSteve.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    RangerSteve.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y

    // So that the left arm is behind the player
    RangerSteve.player.addChild(RangerSteve.playerSprite)

    // Right arm
    RangerSteve.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm-and-weapons')
    RangerSteve.rightArmSprite.anchor.setTo(0.62, 0.4)
    RangerSteve.rightArmSprite.scale.setTo(0.37)
    RangerSteve.rightArmSprite.rotation = 83.4
    RangerSteve.rightArmSprite.animations.frame = selectedPrimaryWeapon.frame
    RangerSteve.rightArmSprite.scale.y *= -1
    RangerSteve.rightArmGroup.add(RangerSteve.rightArmSprite)

    // Add right arm to player as child then offset it
    RangerSteve.player.addChild(RangerSteve.rightArmGroup)
    RangerSteve.rightArmGroup.pivot.x = 0
    RangerSteve.rightArmGroup.pivot.y = 0
    RangerSteve.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    RangerSteve.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y
    RangerSteve.player.anchor.set(0.5)

    /**
     * Camera Settings
     */
    this.camera.follow(RangerSteve.player)
    this.camera.lerp.setTo(0.2, 0.2)
}
