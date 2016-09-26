import { PropTypes } from 'react'
import GameConsts from './GameConsts'

const propTypes = {
    x: PropTypes.number.isRequired,
    y:  PropTypes.number.isRequired,
    id: PropTypes.string.isRequired
}

export default function RemotePlayer(player) {
    check(player, propTypes)

    let newRemotePlayer = this.game.add.sprite(player.x, player.y, 'player')
    newRemotePlayer.width = GameConsts.PLAYER_SPRITE_WIDTH
    newRemotePlayer.height = GameConsts.PLAYER_SPRITE_HEIGHT
    newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    newRemotePlayer.facing = 'right'
    newRemotePlayer.alive = true
    newRemotePlayer.id = player.id
    newRemotePlayer.lastPosition = {
        x: player.x,
        y: player.y
    }

    //  We need to enable physics on the player
    this.physics.arcade.enable(newRemotePlayer)
    newRemotePlayer.body.setSize(GameConsts.PLAYER_BODY_WIDTH, GameConsts.PLAYER_BODY_HEIGHT, 105, 10)
    this.game.slopes.enable(newRemotePlayer)
    newRemotePlayer.body.offset.setTo(15, -150)

    // This stops the effect of gravity on remote players
    newRemotePlayer.body.gravity.y = undefined

    // Make player collide with world boundaries so he doesn't leave the stage
    newRemotePlayer.body.collideWorldBounds = true

    newRemotePlayer.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.animations.add('death', GameConsts.ANIMATION_DEATH, 20, false)

    newRemotePlayer.leftArmGroup = this.game.add.group()
    newRemotePlayer.rightArmGroup = this.game.add.group()
    newRemotePlayer.headGroup = this.game.add.group()
    newRemotePlayer.torsoGroup = this.game.add.group()

    // Torso
    newRemotePlayer.torsoSprite = this.game.add.sprite(GameConsts.PLAYER_BODY.TORSO_X, GameConsts.PLAYER_BODY.TORSO_Y, 'torso')
    newRemotePlayer.torsoSprite.scale.setTo(2.3, 2.2)
    newRemotePlayer.torsoGroup.add(newRemotePlayer.torsoSprite)

    // Head
    newRemotePlayer.headSprite = this.game.add.sprite(GameConsts.PLAYER_BODY.HEAD_X, GameConsts.PLAYER_BODY.HEAD_Y, 'head')
    newRemotePlayer.headSprite.scale.setTo(2.2)
    newRemotePlayer.headGroup.add(newRemotePlayer.headSprite)

    // Left arm
    newRemotePlayer.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    newRemotePlayer.leftArmSprite.anchor.setTo(.2, .2)
    newRemotePlayer.leftArmSprite.scale.setTo(2.2)
    newRemotePlayer.leftArmSprite.rotation = 80.16
    newRemotePlayer.leftArmGroup.add(newRemotePlayer.leftArmSprite)

    // Current weapon
    newRemotePlayer.currentWeaponSprite = this.game.add.sprite(0, 0, player.meta.weaponId)
    newRemotePlayer.currentWeaponSprite.id = player.meta.weaponId
    newRemotePlayer.currentWeaponSprite.scale.setTo(GameConsts.WEAPONS[player.meta.weaponId].position.scale)
    newRemotePlayer.currentWeaponSprite.rotation = GameConsts.WEAPONS[player.meta.weaponId].position.rotation

    // Right arm
    newRemotePlayer.rightArmGroup.add(newRemotePlayer.currentWeaponSprite)
    newRemotePlayer.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm')
    newRemotePlayer.rightArmSprite.anchor.setTo(.2, .24)
    newRemotePlayer.rightArmSprite.scale.setTo(1.7)
    newRemotePlayer.rightArmSprite.rotation = 80.1
    newRemotePlayer.rightArmGroup.add(newRemotePlayer.rightArmSprite)

    // Add left arm to remote player as child then offset it
    newRemotePlayer.addChild(newRemotePlayer.leftArmGroup)
    newRemotePlayer.leftArmGroup.pivot.x = 0
    newRemotePlayer.leftArmGroup.pivot.y = 0
    newRemotePlayer.leftArmGroup.x = GameConsts.PLAYER_BODY.LEFT_ARM_X
    newRemotePlayer.leftArmGroup.y = GameConsts.PLAYER_BODY.LEFT_ARM_Y

    newRemotePlayer.addChild(newRemotePlayer.torsoGroup)
    newRemotePlayer.addChild(newRemotePlayer.headGroup)

    newRemotePlayer.addChild(newRemotePlayer.rightArmGroup)
    newRemotePlayer.rightArmGroup.pivot.x = 0
    newRemotePlayer.rightArmGroup.pivot.y = 0
    newRemotePlayer.rightArmGroup.x = GameConsts.PLAYER_BODY.RIGHT_ARM_X
    newRemotePlayer.rightArmGroup.y = GameConsts.PLAYER_BODY.RIGHT_ARM_Y

    // Muzzle Flash
    newRemotePlayer.muzzleFlash = this.game.make.sprite(0, 0, 'muzzle-flash')
    newRemotePlayer.muzzleFlash.scale.setTo(.6)
    newRemotePlayer.muzzleFlash.animations.add('flash', [0,1,2,3,4,5], 20, true)
    newRemotePlayer.muzzleFlash.animations.play('flash')
    newRemotePlayer.muzzleFlash.y = GameConsts.PLAYER_BODY.MUZZLE_FLASH_X
    newRemotePlayer.muzzleFlash.x = GameConsts.PLAYER_BODY.MUZZLE_FLASH_Y
    newRemotePlayer.muzzleFlash.visible = false
    newRemotePlayer.currentWeaponSprite.addChild(newRemotePlayer.muzzleFlash)

    newRemotePlayer.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.leftJumpjet.anchor.setTo(0)
    newRemotePlayer.leftJumpjet.scale.setTo(.4)
    newRemotePlayer.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    newRemotePlayer.leftJumpjet.animations.play('thrust')
    newRemotePlayer.leftJumpjet.y = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_X
    newRemotePlayer.leftJumpjet.x = GameConsts.PLAYER_BODY.LEFT_JUMP_JET_Y
    newRemotePlayer.leftJumpjet.visible = false
    newRemotePlayer.addChild(newRemotePlayer.leftJumpjet)

    newRemotePlayer.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.rightJumpjet.anchor.setTo(0)
    newRemotePlayer.rightJumpjet.scale.setTo(.4)
    newRemotePlayer.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    newRemotePlayer.rightJumpjet.animations.play('thrust')
    newRemotePlayer.rightJumpjet.y = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_X
    newRemotePlayer.rightJumpjet.x = GameConsts.PLAYER_BODY.RIGHT_JUMP_JET_Y
    newRemotePlayer.rightJumpjet.visible = false
    newRemotePlayer.addChild(newRemotePlayer.rightJumpjet)

    newRemotePlayer.meta = player.meta

    return newRemotePlayer
}
