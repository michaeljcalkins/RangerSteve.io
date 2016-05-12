import GameConsts from './GameConsts'
import { PropTypes } from 'react'

const propTypes = {
    x: PropTypes.number.isRequired,
    y:  PropTypes.number.isRequired,
    id: PropTypes.string.isRequired
}

export default function RemotePlayer(player) {
    check(player, propTypes)

    let newRemotePlayer = this.game.add.sprite(player.x, player.y, 'commando')
    newRemotePlayer.scale.setTo(GameConsts.PLAYER_SCALE)
    newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    newRemotePlayer.facing = 'right'
    newRemotePlayer.height = 91
    newRemotePlayer.width = 94
    newRemotePlayer.alive = true
    newRemotePlayer.animations.add('left', GameConsts.ANIMATION_LEFT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.animations.add('right', GameConsts.ANIMATION_RIGHT, GameConsts.ANIMATION_FRAMERATE, true)
    newRemotePlayer.animations.add('death', GameConsts.ANIMATION_DEATH, 20, false)
    newRemotePlayer.id = player.id
    newRemotePlayer.lastPosition = {
        x: player.x,
        y: player.y
    }


    //  We need to enable physics on the player
    this.physics.arcade.enable(newRemotePlayer)

    // Enable physics on the player
    this.game.physics.enable(newRemotePlayer, Phaser.Physics.ARCADE)
    newRemotePlayer.body.gravity.y = -1900



    newRemotePlayer.leftArmGroup = this.game.add.group()
    newRemotePlayer.rightArmGroup = this.game.add.group()
    newRemotePlayer.headGroup = this.game.add.group()
    newRemotePlayer.torsoGroup = this.game.add.group()

    // Torso
    newRemotePlayer.torsoSprite = this.game.add.sprite(-37, -105, 'torso')
    newRemotePlayer.torsoSprite.scale.setTo(1.8)
    newRemotePlayer.torsoGroup.add(newRemotePlayer.torsoSprite)

    // Head
    newRemotePlayer.headSprite = this.game.add.sprite(0, -148, 'head')
    newRemotePlayer.headSprite.scale.setTo(1.8)
    newRemotePlayer.headGroup.add(newRemotePlayer.headSprite)

    // Left arm
    newRemotePlayer.leftArmSprite = this.game.add.sprite(0, 0, 'left-arm')
    newRemotePlayer.leftArmSprite.anchor.setTo(.2, .2)
    newRemotePlayer.leftArmSprite.scale.setTo(1.6)
    newRemotePlayer.leftArmSprite.rotation = 80.1
    newRemotePlayer.leftArmGroup.add(newRemotePlayer.leftArmSprite)


    // // Gun
    // newRemotePlayer.currentWeaponSprite = this.game.add.sprite(
    //     this.player.meta.primaryWeapon.meta.spriteX,
    //     this.player.meta.primaryWeapon.meta.spriteY,
    //     GameConsts.STARTING_PRIMARY_ID
    // )
    // this.currentWeaponSprite.scale.setTo(this.player.meta.primaryWeapon.meta.scale)
    // this.currentWeaponSprite.rotation = this.player.meta.primaryWeapon.meta.rotation

    // Current weapon
    newRemotePlayer.currentWeaponSprite = this.game.add.sprite(0, 0, 'AK47')
    newRemotePlayer.currentWeaponSprite.rotation = 80.20
    newRemotePlayer.currentWeaponSprite.scale.setTo(1.3)

    // Right arm
    newRemotePlayer.rightArmGroup.add(newRemotePlayer.currentWeaponSprite)
    newRemotePlayer.rightArmSprite = this.game.add.sprite(0, 0, 'right-arm')
    newRemotePlayer.rightArmSprite.anchor.setTo(.2, .24)
    newRemotePlayer.rightArmSprite.scale.setTo(1.7)
    newRemotePlayer.rightArmSprite.rotation = 80.1
    newRemotePlayer.rightArmGroup.add(newRemotePlayer.rightArmSprite)

    newRemotePlayer.addChild(newRemotePlayer.leftArmGroup)
    newRemotePlayer.leftArmGroup.pivot.x = 0
    newRemotePlayer.leftArmGroup.pivot.y = 0
    newRemotePlayer.leftArmGroup.x = 45
    newRemotePlayer.leftArmGroup.y = -70

    newRemotePlayer.addChild(newRemotePlayer.torsoGroup)
    newRemotePlayer.addChild(newRemotePlayer.headGroup)

    newRemotePlayer.addChild(newRemotePlayer.rightArmGroup)
    newRemotePlayer.rightArmGroup.pivot.x = 0
    newRemotePlayer.rightArmGroup.pivot.y = 0
    newRemotePlayer.rightArmGroup.x = -25
    newRemotePlayer.rightArmGroup.y = -65

    return newRemotePlayer
}
