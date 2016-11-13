import GameConsts from 'lib/GameConsts'

export default function() {
    RS.triplekillSound = this.game.add.audio('triplekill')
    RS.multikillSound = this.game.add.audio('multikill')
    RS.ultrakillSound = this.game.add.audio('ultrakill')
    RS.killingspreeSound = this.game.add.audio('killingspree')
    RS.unstoppableSound = this.game.add.audio('unstoppable')
    RS.ludicrouskillSound = this.game.add.audio('ludicrouskill')
    RS.rampagekillSound = this.game.add.audio('rampagekill')
    RS.monsterkillSound = this.game.add.audio('monsterkill')

    RS.weaponSoundEffects = {}
    Object.keys(GameConsts.WEAPONS).forEach((weaponId) => {
        RS.weaponSoundEffects[weaponId] = this.game.add.audio(weaponId)
    })
}
