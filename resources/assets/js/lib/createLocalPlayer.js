import GameConsts from 'lib/GameConsts'
import actions from '../actions'
import updatePlayerColor from './updatePlayerColor'

export default function createLocalPlayer () {
  const state = this.game.store.getState()

  const primaryWeaponId = this.game.store.getState().player.selectedPrimaryWeaponId
  const selectedPrimaryWeapon = GameConsts.WEAPONS[primaryWeaponId]
  const secondaryWeaponId = this.game.store.getState().player.selectedSecondaryWeaponId
  const selectedSecondaryWeapon = GameConsts.WEAPONS[secondaryWeaponId]

  this.game.store.dispatch(actions.player.setPrimaryAmmoRemaining(selectedPrimaryWeapon.ammo))
  this.game.store.dispatch(actions.player.setSecondaryAmmoRemaining(selectedSecondaryWeapon.ammo))

  // Player sprite
  window.RS.player = this.game.add.sprite(-500, -500, 'player-placeholder')
  window.RS.player.anchor.setTo(GameConsts.PLAYER_ANCHOR)

  // Physics
  this.game.physics.arcade.enable(window.RS.player)
  this.game.slopes.enable(window.RS.player)
  this.game.physics.arcade.gravity.y = GameConsts.SLOPE_FEATURES.gravity

  // Add a touch of tile padding for the collision detection
  window.RS.player.body.tilePadding.x = 1
  window.RS.player.body.tilePadding.y = 1

  // Set player minimum and maximum movement speed
  window.RS.player.body.maxVelocity.x = GameConsts.MAX_VELOCITY_X
  window.RS.player.body.maxVelocity.y = GameConsts.MAX_VELOCITY_Y

  // Add drag to the player that slows them down when they are not accelerating
  window.RS.player.body.drag.x = GameConsts.SLOPE_FEATURES.dragX
  window.RS.player.body.drag.y = GameConsts.SLOPE_FEATURES.dragY

  // Update player body Arcade Slopes properties
  window.RS.player.body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
  window.RS.player.body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
  window.RS.player.body.slopes.preferY = GameConsts.SLOPE_FEATURES.minimumOffsetY

  // Make player collide with world boundaries so he doesn't leave the stage
  window.RS.player.body.collideWorldBounds = true

  // Left jump jet
  window.RS.player.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
  window.RS.player.leftJumpjet.anchor.setTo(0)
  window.RS.player.leftJumpjet.animations.add('thrust', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 20, true)
  window.RS.player.leftJumpjet.animations.play('thrust')
  window.RS.player.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
  window.RS.player.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
  window.RS.player.leftJumpjet.visible = false
  window.RS.player.addChild(window.RS.player.leftJumpjet)

  // Right jump jet
  window.RS.player.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
  window.RS.player.rightJumpjet.anchor.setTo(0)
  window.RS.player.rightJumpjet.animations.add('thrust', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 20, true)
  window.RS.player.rightJumpjet.animations.play('thrust')
  window.RS.player.rightJumpjet.y = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_X
  window.RS.player.rightJumpjet.x = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_Y
  window.RS.player.rightJumpjet.visible = false
  window.RS.player.addChild(window.RS.player.rightJumpjet)

  // Player sprite
  window.RS.player.playerSprite = this.game.add.sprite(0, 0, 'player')
  window.RS.player.playerSprite.anchor.setTo(0.5)

  //  Our two animations, walking left and right.
  window.RS.player.playerSprite.animations.add('runRight-faceRight', [0, 1, 2, 3, 4, 5], GameConsts.ANIMATION_FRAMERATE, true)
  window.RS.player.playerSprite.animations.add('runLeft-faceLeft', [7, 8, 9, 10, 11, 12], GameConsts.ANIMATION_FRAMERATE, true)
  window.RS.player.playerSprite.animations.add('runRight-faceLeft', [14, 15, 16, 17, 18, 19], GameConsts.ANIMATION_FRAMERATE, true)
  window.RS.player.playerSprite.animations.add('runLeft-faceRight', [21, 22, 23, 24, 25, 26], GameConsts.ANIMATION_FRAMERATE, true)

  this.game.store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[primaryWeaponId]))
  this.game.store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[secondaryWeaponId]))

  // Left arm
  window.RS.player.leftArmGroup = this.game.add.group()
  window.RS.player.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
  window.RS.player.leftArmSprite.anchor.setTo(0.8, 0.2)
  window.RS.player.leftArmSprite.rotation = 83
  window.RS.player.leftArmGroup.add(window.RS.player.leftArmSprite)

  // Add left arm to player as child then offset it
  window.RS.player.addChild(window.RS.player.leftArmGroup)
  window.RS.player.leftArmGroup.pivot.x = 0
  window.RS.player.leftArmGroup.pivot.y = 0
  window.RS.player.leftArmGroup.x = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_X
  window.RS.player.leftArmGroup.y = GameConsts.PLAYER_FACE.LEFT.LEFT_ARM_Y

  // So that the left arm is behind the player
  window.RS.player.addChild(window.RS.player.playerSprite)

  // Right arm
  window.RS.player.rightArmGroup = this.game.add.group()
  window.RS.player.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm-and-weapons')
  window.RS.player.rightArmSprite.animations.frame = selectedPrimaryWeapon.frame
  window.RS.player.rightArmSprite.anchor.setTo(0.62, 0.4)
  window.RS.player.rightArmSprite.rotation = 83.4
  window.RS.player.rightArmGroup.add(window.RS.player.rightArmSprite)

  // Add right arm to player as child then offset it
  window.RS.player.addChild(window.RS.player.rightArmGroup)
  window.RS.player.rightArmGroup.pivot.x = 0
  window.RS.player.rightArmGroup.pivot.y = 0
  window.RS.player.rightArmGroup.x = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_X
  window.RS.player.rightArmGroup.y = GameConsts.PLAYER_FACE.LEFT.RIGHT_ARM_Y
  window.RS.player.anchor.set(0.5)

  const playerState = state.room.players[window.SOCKET_ID]
  if (playerState && playerState.team) updatePlayerColor(window.RS.player, playerState.team)
  window.RS.player.data = {
    facing: 'left',
    ...playerState
  }

  /**
   * Camera Settings
   */
  this.camera.follow(window.RS.player)
  this.camera.lerp.setTo(0.2, 0.2)

  window.RS.player.x = state.player.initialPosition.x
  window.RS.player.y = state.player.initialPosition.y
}
