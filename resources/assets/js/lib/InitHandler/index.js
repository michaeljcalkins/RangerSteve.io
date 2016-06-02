import InitEvents from './InitEvents'
import InitHurtBorder from './InitHurtBorder'
import InitMapAndPlayer from './InitMapAndPlayer'
import InitWindowEvents from './InitWindowEvents'
import InitBullets from './InitBullets'
import InitDetectIdleUser from './InitDetectIdleUser'

export default function() {
    InitMapAndPlayer.call(this)
    InitBullets.call(this)
    InitEvents.call(this)
    InitHurtBorder.call(this)
    InitWindowEvents.call(this)
    InitDetectIdleUser()
}
