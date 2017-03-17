import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from './updatePlayerAngles'
import updatePlayerColor from './updatePlayerColor'

const usernameTextStyle = {
  align: 'center',
  fill: '#fff',
  font: '10px Arial',
  stroke: 'black',
  strokeThickness: 2
}

export default function RemotePlayer (playerId, playerData) {
  const newRemotePlayer = this.game.add.sprite(playerData.x, playerData.y, 'player-placeholder')
  newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
  newRemotePlayer.alive = playerData.health > 0
  newRemotePlayer.visible = playerData.health > 0

  newRemotePlayer.data = {
    id: playerId,
    facing: 'right',

    // Set for basic entity interpolation
    x: playerData.x,
    y: playerData.y,

    velocityX: playerData.velocityX,
    velocityY: playerData.velocityY,

    lastPosition: {
      x: playerData.x,
      y: playerData.y
    }
  }

  // Physics
  this.game.arcadePolygons.enableSpriteBody(newRemotePlayer, this)

  // Set player minimum and maximum movement speed
  newRemotePlayer.body.maxVelocity.x = GameConsts.PLAYER_PHYSICS.MAX_VELOCITY_X
  newRemotePlayer.body.maxVelocity.y = GameConsts.PLAYER_PHYSICS.MAX_VELOCITY_Y

  // Add drag to the player that slows them down when they are not accelerating
  newRemotePlayer.body.drag.x = GameConsts.PLAYER_PHYSICS.DRAG_X
  newRemotePlayer.body.drag.y = GameConsts.PLAYER_PHYSICS.DRAG_Y

  // Update player body Arcade Slopes properties
  newRemotePlayer.body.sat.friction = GameConsts.PLAYER_PHYSICS.FRICTION
  newRemotePlayer.body.sat.bounce = GameConsts.PLAYER_PHYSICS.BOUNCE

  // Make player collide with world boundaries so he doesn't leave the stage
  newRemotePlayer.body.collideWorldBounds = true

  newRemotePlayer.player = this.game.add.group()
  newRemotePlayer.leftArmGroup = this.game.add.group()
  newRemotePlayer.rightArmGroup = this.game.add.group()

  // Left jump jet
  newRemotePlayer.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
  newRemotePlayer.leftJumpjet.anchor.setTo(0)
  newRemotePlayer.leftJumpjet.animations.add('thrust', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 20, true)
  newRemotePlayer.leftJumpjet.animations.play('thrust')
  newRemotePlayer.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
  newRemotePlayer.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
  newRemotePlayer.leftJumpjet.visible = false
  newRemotePlayer.addChild(newRemotePlayer.leftJumpjet)

  // Right jump jet
  newRemotePlayer.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
  newRemotePlayer.rightJumpjet.anchor.setTo(0)
  newRemotePlayer.rightJumpjet.animations.add('thrust', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 20, true)
  newRemotePlayer.rightJumpjet.animations.play('thrust')
  newRemotePlayer.rightJumpjet.y = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_X
  newRemotePlayer.rightJumpjet.x = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_Y
  newRemotePlayer.rightJumpjet.visible = false
  newRemotePlayer.addChild(newRemotePlayer.rightJumpjet)

  // Player sprite
  newRemotePlayer.playerSprite = this.game.add.sprite(0, 0, 'player')
  newRemotePlayer.playerSprite.anchor.setTo(0.5)
  newRemotePlayer.playerSprite.animations.frame = GameConsts.STANDING_RIGHT_FRAME

  //  Our two animations, walking left and right.
  newRemotePlayer.playerSprite.animations.add('runRight-faceRight', [0, 1, 2, 3, 4, 5], GameConsts.ANIMATION_FRAMERATE, true)
  newRemotePlayer.playerSprite.animations.add('runLeft-faceLeft', [7, 8, 9, 10, 11, 12], GameConsts.ANIMATION_FRAMERATE, true)
  newRemotePlayer.playerSprite.animations.add('runRight-faceLeft', [14, 15, 16, 17, 18, 19], GameConsts.ANIMATION_FRAMERATE, true)
  newRemotePlayer.playerSprite.animations.add('runLeft-faceRight', [21, 22, 23, 24, 25, 26], GameConsts.ANIMATION_FRAMERATE, true)

  // Left arm
  newRemotePlayer.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
  newRemotePlayer.leftArmSprite.anchor.setTo(0.8, 0.2)
  newRemotePlayer.leftArmSprite.rotation = 83
  newRemotePlayer.leftArmSprite.scale.y *= -1
  newRemotePlayer.leftArmGroup.add(newRemotePlayer.leftArmSprite)

  // Add left arm to player as child then offset it
  newRemotePlayer.addChild(newRemotePlayer.leftArmGroup)
  newRemotePlayer.leftArmGroup.pivot.x = 0
  newRemotePlayer.leftArmGroup.pivot.y = 0
  newRemotePlayer.leftArmGroup.angle = 93.67
  newRemotePlayer.leftArmGroup.x = GameConsts.PLAYER_BODY.LEFT_ARM_X
  newRemotePlayer.leftArmGroup.y = GameConsts.PLAYER_BODY.LEFT_ARM_Y

  // So that the left arm is behind the player
  newRemotePlayer.addChild(newRemotePlayer.playerSprite)

  // Right arm
  newRemotePlayer.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm-and-weapons')
  newRemotePlayer.rightArmSprite.anchor.setTo(0.62, 0.4)
  newRemotePlayer.rightArmSprite.rotation = 83.4
  newRemotePlayer.rightArmSprite.scale.y *= -1
  newRemotePlayer.rightArmGroup.angle = 87.67
  newRemotePlayer.rightArmGroup.add(newRemotePlayer.rightArmSprite)
  newRemotePlayer.rightArmSprite.animations.frame = GameConsts.WEAPONS[playerData.weaponId].frame

  // Add right arm to player as child then offset it
  newRemotePlayer.addChild(newRemotePlayer.rightArmGroup)
  newRemotePlayer.rightArmGroup.pivot.x = 0
  newRemotePlayer.rightArmGroup.pivot.y = 0
  newRemotePlayer.rightArmGroup.x = GameConsts.PLAYER_BODY.RIGHT_ARM_X
  newRemotePlayer.rightArmGroup.y = GameConsts.PLAYER_BODY.RIGHT_ARM_Y
  if (playerData.team) updatePlayerColor(newRemotePlayer, playerData.team)
  newRemotePlayer.data.team = playerData.team

  newRemotePlayer.anchor.set(0.5)
  updatePlayerAngles(newRemotePlayer, 200)
  newRemotePlayer.playerSprite.animations.frame = GameConsts.STANDING_LEFT_FRAME

  const enemyPlayerName = playerData.nickname
    ? playerData.nickname
    : 'Unnamed Ranger'

  newRemotePlayer.usernameText = this.game.add.text(0, -50, enemyPlayerName, usernameTextStyle)
  newRemotePlayer.addChild(newRemotePlayer.usernameText)
  newRemotePlayer.usernameText.x = (newRemotePlayer.usernameText.width / 2) * -1
  newRemotePlayer.usernameText.smoothed = true

  return newRemotePlayer
}
