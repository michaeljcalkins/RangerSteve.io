export default function (killingSpreeCount, sfxVolume) {
  if (killingSpreeCount === 3) {
    window.RS.triplekillSound.volume = sfxVolume
    window.RS.triplekillSound.play()
  } else if (killingSpreeCount === 4) {
    window.RS.multikillSound.volume = sfxVolume
    window.RS.multikillSound.play()
  } else if (killingSpreeCount === 6) {
    window.RS.ultrakillSound.volume = sfxVolume
    window.RS.ultrakillSound.play()
  } else if (killingSpreeCount === 8) {
    window.RS.killingspreeSound.volume = sfxVolume
    window.RS.killingspreeSound.play()
  } else if (killingSpreeCount === 10) {
    window.RS.unstoppableSound.volume = sfxVolume
    window.RS.unstoppableSound.play()
  } else if (killingSpreeCount === 12) {
    window.RS.ludicrouskillSound.volume = sfxVolume
    window.RS.ludicrouskillSound.play()
  } else if (killingSpreeCount === 14) {
    window.RS.rampagekillSound.volume = sfxVolume
    window.RS.rampagekillSound.play()
  } else if (killingSpreeCount === 15) {
    window.RS.monsterkillSound.volume = sfxVolume
    window.RS.monsterkillSound.play()
  }
}
