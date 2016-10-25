export default function(killingSpreeCount, sfxVolume) {
    if (killingSpreeCount === 3) {
        RangerSteve.triplekillSound.volume = sfxVolume
        RangerSteve.triplekillSound.play()
    } else if (killingSpreeCount === 4) {
        RangerSteve.multikillSound.volume = sfxVolume
        RangerSteve.multikillSound.play()
    } else if (killingSpreeCount === 6) {
        RangerSteve.ultrakillSound.volume = sfxVolume
        RangerSteve.ultrakillSound.play()
    } else if (killingSpreeCount === 8) {
        RangerSteve.killingspreeSound.volume = sfxVolume
        RangerSteve.killingspreeSound.play()
    } else if (killingSpreeCount === 10) {
        RangerSteve.unstoppableSound.volume = sfxVolume
        RangerSteve.unstoppableSound.play()
    } else if (killingSpreeCount === 12) {
        RangerSteve.ludicrouskillSound.volume = sfxVolume
        RangerSteve.ludicrouskillSound.play()
    } else if (killingSpreeCount === 14) {
        RangerSteve.rampagekillSound.volume = sfxVolume
        RangerSteve.rampagekillSound.play()
    } else if (killingSpreeCount === 15) {
        RangerSteve.monsterkillSound.volume = sfxVolume
        RangerSteve.monsterkillSound.play()
    }
}
