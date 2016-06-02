import InitEvents from './InitEvents'
import InitHurtBorder from './InitHurtBorder'
import InitMapAndPlayer from './InitMapAndPlayer'
import InitWindowEvents from './InitWindowEvents'

export default function() {
    InitMapAndPlayer.call(this)
    InitEvents.call(this)
    InitHurtBorder.call(this)
    InitWindowEvents.call(this)
}
