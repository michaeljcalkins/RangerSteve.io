export default function() {
    this.triplekillSound = this.game.add.audio('triplekill')
    EventHandler.on('play triplekill', () => {
        this.triplekillSound.volume = this.sfxVolume
        this.triplekillSound.play()
    })

    this.multikillSound = this.game.add.audio('multikill')
    EventHandler.on('play multikill', () => {
        this.multikillSound.volume = this.sfxVolume
        this.multikillSound.play()
    })

    this.ultrakillSound = this.game.add.audio('ultrakill')
    EventHandler.on('play ultrakill', () => {
        this.ultrakillSound.volume = this.sfxVolume
        this.ultrakillSound.play()
    })

    this.killingspreeSound = this.game.add.audio('killingspree')
    EventHandler.on('play killingspree', () => {
        this.killingspreeSound.volume = this.sfxVolume
        this.killingspreeSound.play()
    })

    this.unstoppableSound = this.game.add.audio('unstoppable')
    EventHandler.on('play unstoppable', () => {
        this.unstoppableSound.volume = this.sfxVolume
        this.unstoppableSound.play()
    })

    this.ludicrouskillSound = this.game.add.audio('ludicrouskill')
    EventHandler.on('play ludicrouskill', () => {
        this.ludicrouskillSound.volume = this.sfxVolume
        this.ludicrouskillSound.play()
    })

    this.rampagekillSound = this.game.add.audio('rampagekill')
    EventHandler.on('play rampagekill', () => {
        this.rampagekillSound.volume = this.sfxVolume
        this.rampagekillSound.play()
    })

    this.monsterkillSound = this.game.add.audio('monsterkill')
    EventHandler.on('play monsterkill', () => {
        this.monsterkillSound.volume = this.sfxVolume
        this.monsterkillSound.play()
    })
}
