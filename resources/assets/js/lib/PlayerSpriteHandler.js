import GameConsts from 'lib/GameConsts'
import Maps from './Maps'
import actions from '../actions'
import GetSpawnPoint from './GetSpawnPoint'

export default function PlayerSpriteHandler() {
    const state = this.game.store.getState()

    const spawnPoints = Maps[state.room.map].getSpawnPoints()
    const spawnPoint = GetSpawnPoint(spawnPoints, RS.enemies.children)

    const primaryWeaponId = this.game.store.getState().player.selectedPrimaryWeaponId
    const selectedPrimaryWeapon = GameConsts.WEAPONS[primaryWeaponId]
    const secondaryWeaponId = this.game.store.getState().player.selectedSecondaryWeaponId
    const selectedSecondaryWeapon = GameConsts.WEAPONS[secondaryWeaponId]

    this.game.store.dispatch(actions.player.setPrimaryAmmoRemaining(selectedPrimaryWeapon.ammo))
    this.game.store.dispatch(actions.player.setSecondaryAmmoRemaining(selectedSecondaryWeapon.ammo))

    RS.playerGroup = this.game.add.group()
    RS.leftArmGroup = this.game.add.group()
    RS.rightArmGroup = this.game.add.group()

    // Player sprite
    RS.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, 'player-placeholder')
    RS.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

    // Physics
    this.game.physics.arcade.enable(RS.player)
    this.game.slopes.enable(RS.player)
    this.game.physics.arcade.gravity.y = GameConsts.SLOPE_FEATURES.gravity

    // Add a touch of tile padding for the collision detection
    RS.player.body.tilePadding.x = 1
    RS.player.body.tilePadding.y = 1

    // Set player minimum and maximum movement speed
    RS.player.body.maxVelocity.x = GameConsts.MAX_VELOCITY_X
    RS.player.body.maxVelocity.y = GameConsts.MAX_VELOCITY_Y

    // Add drag to the player that slows them down when they are not accelerating
    RS.player.body.drag.x = GameConsts.SLOPE_FEATURES.dragX
    RS.player.body.drag.y = GameConsts.SLOPE_FEATURES.dragY

    // Update player body Arcade Slopes properties
    RS.player.body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
    RS.player.body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
    RS.player.body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY

    // Make player collide with world boundaries so he doesn't leave the stage
    RS.player.body.collideWorldBounds = true

    // Left jump jet
    RS.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    RS.leftJumpjet.anchor.setTo(0)
    RS.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    RS.leftJumpjet.animations.play('thrust')
    RS.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
    RS.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
    RS.leftJumpjet.visible = false
    RS.player.addChild(RS.leftJumpjet)

    // Right jump jet
    RS.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    RS.rightJumpjet.anchor.setTo(0)
    RS.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    RS.rightJumpjet.animations.play('thrust')
    RS.rightJumpjet.y = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_X
    RS.rightJumpjet.x = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_Y
    RS.rightJumpjet.visible = false
    RS.player.addChild(RS.rightJumpjet)

    // Player sprite
    RS.playerSprite = this.game.add.sprite(0, 0, 'player')
    RS.playerSprite.anchor.setTo(.5)

    //  Our two animations, walking left and right.
    RS.playerSprite.animations.add('runRight-faceRight', [0,1,2,3,4,5], GameConsts.ANIMATION_FRAMERATE, true)
    RS.playerSprite.animations.add('runLeft-faceLeft', [7,8,9,10,11,12], GameConsts.ANIMATION_FRAMERATE, true)
    RS.playerSprite.animations.add('runRight-faceLeft', [14,15,16,17,18,19], GameConsts.ANIMATION_FRAMERATE, true)
    RS.playerSprite.animations.add('runLeft-faceRight', [21,22,23,24,25,26], GameConsts.ANIMATION_FRAMERATE, true)
    RS.playerSprite.animations.frame = GameConsts.STANDING_RIGHT_FRAME

    this.game.store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[primaryWeaponId]))
    this.game.store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[secondaryWeaponId]))

    // Left arm
    RS.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    RS.leftArmSprite.anchor.setTo(0.8, .2)
    RS.leftArmSprite.rotation = 83
    RS.leftArmSprite.scale.y *= -1
    RS.leftArmGroup.add(RS.leftArmSprite)

    // Add left arm to player as child then offset it
    RS.player.addChild(RS.leftArmGroup)
    RS.leftArmGroup.pivot.x = 0
    RS.leftArmGroup.pivot.y = 0
    RS.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
    RS.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y

    // So that the left arm is behind the player
    RS.player.addChild(RS.playerSprite)

    // Right arm
    RS.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm-and-weapons')
    RS.rightArmSprite.animations.frame = selectedPrimaryWeapon.frame
    RS.rightArmSprite.anchor.setTo(0.62, 0.4)
    RS.rightArmSprite.rotation = 83.4
    RS.rightArmSprite.scale.y *= -1
    RS.rightArmGroup.add(RS.rightArmSprite)

    // Add right arm to player as child then offset it
    RS.player.addChild(RS.rightArmGroup)
    RS.rightArmGroup.pivot.x = 0
    RS.rightArmGroup.pivot.y = 0
    RS.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
    RS.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y
    RS.player.anchor.set(0.5)

    /**
     * Camera Settings
     */
    this.camera.follow(RS.player)
    this.camera.lerp.setTo(0.2, 0.2)
}
