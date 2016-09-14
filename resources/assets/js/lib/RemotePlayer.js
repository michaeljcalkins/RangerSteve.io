import { PropTypes } from 'react'
import GameConsts from './GameConsts'

const propTypes = {
    x: PropTypes.number.isRequired,
    y:  PropTypes.number.isRequired,
    id: PropTypes.string.isRequired
}

export default function RemotePlayer(player) {
    check(player, propTypes)

    let newRemotePlayer = this.game.add.sprite(player.x, player.y, 'commando')
    newRemotePlayer.anchor.setTo(GameConsts.PLAYER_ANCHOR)
    newRemotePlayer.facing = 'right'
    newRemotePlayer.width = GameConsts.PLAYER_SPRITE_WIDTH
    newRemotePlayer.height = GameConsts.PLAYER_SPRITE_HEIGHT
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
    newRemotePlayer.body.setSize(GameConsts.PLAYER_BODY_WIDTH, GameConsts.PLAYER_BODY_HEIGHT, 105, 10)
    this.game.slopes.enable(newRemotePlayer)
    newRemotePlayer.body.gravity.y = GameConsts.gravity

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

    // Muzzle Flash
    newRemotePlayer.muzzleFlash = this.game.make.sprite(0, 0, 'muzzle-flash')
    newRemotePlayer.muzzleFlash.scale.setTo(.6)
    newRemotePlayer.muzzleFlash.animations.add('flash', [0,1,2,3,4,5], 20, true)
    newRemotePlayer.muzzleFlash.animations.play('flash')
    newRemotePlayer.muzzleFlash.y = -72
    newRemotePlayer.muzzleFlash.x = 102
    newRemotePlayer.muzzleFlash.visible = false
    newRemotePlayer.currentWeaponSprite.addChild(newRemotePlayer.muzzleFlash)

    newRemotePlayer.leftJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.leftJumpjet.anchor.setTo(0)
    newRemotePlayer.leftJumpjet.scale.setTo(.4)
    newRemotePlayer.leftJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    newRemotePlayer.leftJumpjet.animations.play('thrust')
    newRemotePlayer.leftJumpjet.y = 130
    newRemotePlayer.leftJumpjet.x = -78
    newRemotePlayer.leftJumpjet.visible = false
    newRemotePlayer.addChild(newRemotePlayer.leftJumpjet)

    newRemotePlayer.rightJumpjet = this.game.make.sprite(0, 0, 'jumpjet')
    newRemotePlayer.rightJumpjet.anchor.setTo(0)
    newRemotePlayer.rightJumpjet.scale.setTo(.4)
    newRemotePlayer.rightJumpjet.animations.add('thrust', [0,1,2,3,4,5,6,7,8,9,10,11,12], 20, true)
    newRemotePlayer.rightJumpjet.animations.play('thrust')
    newRemotePlayer.rightJumpjet.y = 130
    newRemotePlayer.rightJumpjet.x = -7
    newRemotePlayer.rightJumpjet.visible = false
    newRemotePlayer.addChild(newRemotePlayer.rightJumpjet)

    newRemotePlayer.meta = player.meta

    return newRemotePlayer
}
