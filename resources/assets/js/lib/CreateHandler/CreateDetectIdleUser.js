import GameConsts from '../GameConsts'

export default function() {
    let t
    window.onload = resetTimer
    document.onmousemove = resetTimer
    document.onkeypress = resetTimer

    function playerIsIdle() {
        document.location.href = '/'
    }

    function resetTimer() {
        clearTimeout(t)
        t = setTimeout(playerIsIdle, GameConsts.MAX_IDLE_SECONDS * 1000)
    }
}
