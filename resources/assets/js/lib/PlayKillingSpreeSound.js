export default function(killingSpreeCount, sfxVolume) {
    if (killingSpreeCount === 3) {
        this.triplekillSound.volume = sfxVolume
        this.triplekillSound.play()
    } else if (killingSpreeCount === 4) {
        this.multikillSound.volume = sfxVolume
        this.multikillSound.play()
    } else if (killingSpreeCount === 6) {
        this.ultrakillSound.volume = sfxVolume
        this.ultrakillSound.play()
    } else if (killingSpreeCount === 8) {
        this.killingspreeSound.volume = sfxVolume
        this.killingspreeSound.play()
    } else if (killingSpreeCount === 10) {
        this.unstoppableSound.volume = sfxVolume
        this.unstoppableSound.play()
    } else if (killingSpreeCount === 12) {
        this.ludicrouskillSound.volume = sfxVolume
        this.ludicrouskillSound.play()
    } else if (killingSpreeCount === 14) {
        this.rampagekillSound.volume = sfxVolume
        this.rampagekillSound.play()
    } else if (killingSpreeCount === 15) {
        this.monsterkillSound.volume = sfxVolume
        this.monsterkillSound.play()
    }
}
