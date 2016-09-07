import GameConsts from '../GameConsts'

export default function() {
    this.triplekillSound = this.game.add.audio('triplekill')
    this.multikillSound = this.game.add.audio('multikill')
    this.ultrakillSound = this.game.add.audio('ultrakill')
    this.killingspreeSound = this.game.add.audio('killingspree')
    this.unstoppableSound = this.game.add.audio('unstoppable')
    this.ludicrouskillSound = this.game.add.audio('ludicrouskill')
    this.rampagekillSound = this.game.add.audio('rampagekill')
    this.monsterkillSound = this.game.add.audio('monsterkill')

    this.weaponSoundEffects = {}
    Object.keys(GameConsts.WEAPONS).forEach((weaponId) => {
        this.weaponSoundEffects[weaponId] = this.game.add.audio(weaponId)
    })
}
