export default function() {
    let t
    window.onload = resetTimer
    document.onmousemove = resetTimer
    document.onkeypress = resetTimer

    function playerIsIdle() {
        window.location.href = 'https://rangersteve.io'
    }

    function resetTimer() {
        clearTimeout(t)
        t = setTimeout(playerIsIdle, 60000)
    }
}
