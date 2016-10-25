import GameConsts from '../GameConsts'

export default function() {
    RangerSteve.triplekillSound = this.game.add.audio('triplekill')
    RangerSteve.multikillSound = this.game.add.audio('multikill')
    RangerSteve.ultrakillSound = this.game.add.audio('ultrakill')
    RangerSteve.killingspreeSound = this.game.add.audio('killingspree')
    RangerSteve.unstoppableSound = this.game.add.audio('unstoppable')
    RangerSteve.ludicrouskillSound = this.game.add.audio('ludicrouskill')
    RangerSteve.rampagekillSound = this.game.add.audio('rampagekill')
    RangerSteve.monsterkillSound = this.game.add.audio('monsterkill')

    RangerSteve.weaponSoundEffects = {}
    Object.keys(GameConsts.WEAPONS).forEach((weaponId) => {
        RangerSteve.weaponSoundEffects[weaponId] = this.game.add.audio(weaponId)
    })
}
