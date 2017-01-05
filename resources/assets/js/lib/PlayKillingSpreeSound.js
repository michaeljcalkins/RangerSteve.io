export default function(killingSpreeCount, sfxVolume) {
  if (killingSpreeCount === 3) {
    RS.triplekillSound.volume = sfxVolume
    RS.triplekillSound.play()
  } else if (killingSpreeCount === 4) {
    RS.multikillSound.volume = sfxVolume
    RS.multikillSound.play()
  } else if (killingSpreeCount === 6) {
    RS.ultrakillSound.volume = sfxVolume
    RS.ultrakillSound.play()
  } else if (killingSpreeCount === 8) {
    RS.killingspreeSound.volume = sfxVolume
    RS.killingspreeSound.play()
  } else if (killingSpreeCount === 10) {
    RS.unstoppableSound.volume = sfxVolume
    RS.unstoppableSound.play()
  } else if (killingSpreeCount === 12) {
    RS.ludicrouskillSound.volume = sfxVolume
    RS.ludicrouskillSound.play()
  } else if (killingSpreeCount === 14) {
    RS.rampagekillSound.volume = sfxVolume
    RS.rampagekillSound.play()
  } else if (killingSpreeCount === 15) {
    RS.monsterkillSound.volume = sfxVolume
    RS.monsterkillSound.play()
  }
}
