import store from 'store'
import GameConsts from '../lib/GameConsts'
import GetQueryString from '../lib/GetQueryString'

export default function Create() {
    this.roomId = GetQueryString('roomId')
    this.room = null
    this.sfxVolume = store.get('sfxVolume', GameConsts.STARTING_SFX_VOLUME)
    this.musicVolume = store.get('musicVolume', GameConsts.STARTING_MUSIC_VOLUME)
    this.jumping = false

    // this.fullDamageBlastRadius = this.add.sprite(0, 0, 'ground')
    // this.fullDamageBlastRadius.enableBody = true
    // this.fullDamageBlastRadius.physicsBodyType = Phaser.Physics.ARCADE
    // this.fullDamageBlastRadius.anchor.setTo(.5, .5)
    // this.fullDamageBlastRadius.height = 170
    // this.fullDamageBlastRadius.width = 200
    //
    //
    // this.partialDamageBlastRadius = this.add.sprite(0, 0, 'ground')
    // this.partialDamageBlastRadius.enableBody = true
    // this.partialDamageBlastRadius.physicsBodyType = Phaser.Physics.ARCADE
    // this.partialDamageBlastRadius.anchor.setTo(.5, .5)
    // this.partialDamageBlastRadius.height = 170
    // this.partialDamageBlastRadius.width = 200


    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.physicsBodyType = Phaser.Physics.ARCADE
    this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.setShowAll()
    this.game.scale.refresh()


    /**
     * Enemy Settings
     */
    this.enemies = this.game.add.group()
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE
    this.physics.arcade.enable(this.enemies)
    this.game.physics.enable(this.enemies, Phaser.Physics.ARCADE)


    /**
     * Weapons
     */
    this.currentWeapon = 'primaryWeapon'


    /**
     * Audio
     */
    this.audioPlayer = new Audio()
    this.audioPlayer.controls = false
    this.audioPlayer.src = '/audio/ost.mp3'
    this.audioPlayer.volume = this.musicVolume
    this.audioPlayer.play()

    // Creates a loop for music
    this.audioPlayer.addEventListener('ended', function() {
        this.currentTime = 0
        this.play()
    }, false)

    window.Meta = {
        kickPlayerByUsername: (nickname) => {
            return this.socket.emit('kick player', {
                roomId: this.roomId,
                nickname
            })
        }
    }
}
