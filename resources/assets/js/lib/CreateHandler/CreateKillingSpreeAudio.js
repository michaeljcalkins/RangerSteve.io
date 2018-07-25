import GameConsts from 'lib/GameConsts'

export default function () {
  window.RS.triplekillSound = this.game.add.audio('triplekill')
  window.RS.multikillSound = this.game.add.audio('multikill')
  window.RS.ultrakillSound = this.game.add.audio('ultrakill')
  window.RS.killingspreeSound = this.game.add.audio('killingspree')
  window.RS.unstoppableSound = this.game.add.audio('unstoppable')
  window.RS.ludicrouskillSound = this.game.add.audio('ludicrouskill')
  window.RS.rampagekillSound = this.game.add.audio('rampagekill')
  window.RS.monsterkillSound = this.game.add.audio('monsterkill')

  window.RS.weaponSoundEffects = {}
  Object.keys(GameConsts.WEAPONS).forEach((weaponId) => {
    window.RS.weaponSoundEffects[weaponId] = this.game.add.audio(weaponId)
  })
}
