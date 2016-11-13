import GameConsts from 'lib/GameConsts'
import debounce from 'lodash/debounce'

const playerIsIdle = debounce(() => {
    document.location.href = '/'
}, GameConsts.MAX_IDLE_SECONDS * 1000)

export default function() {
    window.onload = playerIsIdle
    document.onmousemove = playerIsIdle
    document.onkeypress = playerIsIdle
}
