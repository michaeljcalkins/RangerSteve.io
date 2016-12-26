// @flow
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from './updatePlayerAngles'

export default function RemotePlayer(player: {
    id: string,
    data: Object,
    x: number,
    y: number,
}) {
    const newRemotePlayer = this.game.add.sprite(player.x, player.y, 'player-placeholder')
    newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    newRemotePlayer.facing = 'right'
    newRemotePlayer.alive = true
    newRemotePlayer.id = player.id
    newRemotePlayer.lastPosition = {
        x: player.x,
        y: player.y,
    }

    //  Physics
    this.game.physics.arcade.enable(newRemotePlayer)
    newRemotePlayer.body.setSize(GameConsts.PLAYER_BODY_WIDTH, GameConsts.PLAYER_BODY_HEIGHT)

    this.game.slopes.enable(newRemotePlayer)

    // This stops the effect of gravity on remote players
    newRemotePlayer.body.gravity.y = undefined

    // Make player collide with world boundaries so he doesn't leave the stage
    newRemotePlayer.body.collideWorldBounds = true

    newRemotePlayer.player = this.game.add.group()
    newRemotePlayer.leftArmGroup = this.game.add.group()
    newRemotePlayer.rightArmGroup = this.game.add.group()

    // Left jump jet
    newRemotePlayer.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.leftJumpjet.anchor.setTo(0)
    newRemotePlayer.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    newRemotePlayer.leftJumpjet.animations.play('thrust')
    newRemotePlayer.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
    newRemotePlayer.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
    newRemotePlayer.leftJumpjet.visible = false
    newRemotePlayer.addChild(newRemotePlayer.leftJumpjet)

    // Right jump jet
    newRemotePlayer.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.rightJumpjet.anchor.setTo(0)
    newRemotePlayer.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
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
    newRemotePlayer.playerSprite.animations.add('runRight-faceRight', [0,1,2,3,4,5], GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.playerSprite.animations.add('runLeft-faceLeft', [7,8,9,10,11,12], GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.playerSprite.animations.add('runRight-faceLeft', [14,15,16,17,18,19], GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.playerSprite.animations.add('runLeft-faceRight', [21,22,23,24,25,26], GameConsts.ANIMATION_FRAMERATE, true)

    // Left arm
    newRemotePlayer.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    newRemotePlayer.leftArmSprite.anchor.setTo(0.8, .2)
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
    newRemotePlayer.rightArmSprite.animations.frame = GameConsts.WEAPONS[player.weaponId].frame
    newRemotePlayer.rightArmSprite.scale.y *= -1
    newRemotePlayer.rightArmGroup.angle = 87.67
    newRemotePlayer.rightArmGroup.add(newRemotePlayer.rightArmSprite)

    // Add right arm to player as child then offset it
    newRemotePlayer.addChild(newRemotePlayer.rightArmGroup)
    newRemotePlayer.rightArmGroup.pivot.x = 0
    newRemotePlayer.rightArmGroup.pivot.y = 0
    newRemotePlayer.rightArmGroup.x = GameConsts.PLAYER_BODY.RIGHT_ARM_X
    newRemotePlayer.rightArmGroup.y = GameConsts.PLAYER_BODY.RIGHT_ARM_Y

    newRemotePlayer.anchor.set(0.5)
    newRemotePlayer.data = player.data
    updatePlayerAngles(newRemotePlayer, 200)
    newRemotePlayer.playerSprite.animations.frame = GameConsts.STANDING_LEFT_FRAME

    return newRemotePlayer
}
