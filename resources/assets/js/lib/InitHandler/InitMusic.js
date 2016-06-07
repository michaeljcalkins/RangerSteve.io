export default function() {
    this.audioPlayer = new Audio()
    this.audioPlayer.controls = false
    this.audioPlayer.src = '/audio/ost.mp3'
    this.audioPlayer.volume = this.game.store.getState().game.musicVolume
    this.audioPlayer.play()

    // When the song ends restart it
    this.audioPlayer.addEventListener('ended', function() {
        this.currentTime = 0
        this.play()
    }, false)
}
