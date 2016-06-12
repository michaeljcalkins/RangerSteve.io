import InitEvents from './InitEvents'
import InitHurtBorder from './InitHurtBorder'
import InitMapAndPlayer from './InitMapAndPlayer'
import InitWindowEvents from './InitWindowEvents'
import InitBullets from './InitBullets'
import InitMusic from './InitMusic'
import InitDetectIdleUser from './InitDetectIdleUser'
import InitKillingSpreeAudio from './InitKillingSpreeAudio'

export default function() {
    InitMapAndPlayer.call(this)
    InitBullets.call(this)
    InitEvents.call(this)
    InitHurtBorder.call(this)
    InitWindowEvents.call(this)
    InitMusic.call(this)
    InitKillingSpreeAudio.call(this)
    InitDetectIdleUser()
}
