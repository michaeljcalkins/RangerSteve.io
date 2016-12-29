import { assert } from 'chai'

import getPlayerWithBestAccuracy from './getPlayerWithBestAccuracy'

describe('getPlayerMetaWithBestAccuracy', function() {
    it('should return false if there not enough data to calculate stat', function() {
        const room = {"roundEndTime":1478014202,"id":"perfect-dodo-19","players":{"MAtbtm0TofuQVB-kAAAG":{"x":2300,"y":1074,"id":"MAtbtm0TofuQVB-kAAAG","data":{"health":100,"kills":0,"deaths":0,"bestKillingSpree":0,"score":0,"nickname":"Lead Engineer John","killingSpree":0,"headshots":0,"secondsInRound":2,"damageInflicted":0,"bulletsFired":0,"bulletsHit":0,"weaponId":"AK47","team":null},"rightArmAngle":44.84195533317511,"leftArmAngle":6.8419553331751075,"facing":"right"}},"state":"active","map":"PunkFallout","gamemode":"Deathmatch","redTeamScore":0,"blueTeamScore":0,"messages":[]}
        assert.equal(getPlayerWithBestAccuracy(room), false)
    })

    it('should return object if there is enough data to calculate stat', function() {
        const room = {"roundEndTime":1478014248,"id":"perfect-dodo-19","players":{"gpjE8jZgPNseoxfVAAAJ":{"x":2772.833333333347,"y":1770,"id":"gpjE8jZgPNseoxfVAAAJ","data":{"health":100,"kills":0,"deaths":0,"bestKillingSpree":0,"score":0,"nickname":"Lead Engineer John","killingSpree":0,"headshots":1,"secondsInRound":26,"damageInflicted":0,"bulletsFired":4,"bulletsHit":2,"weaponId":"AK47","team":"red","accuracy":"50.0"},"rightArmAngle":83.69060942085375,"leftArmAngle":89.69060942085375,"facing":"right"},"VNd8DVD3GMWBlYVsAAAK":{"x":2900,"y":1770,"id":"VNd8DVD3GMWBlYVsAAAK","data":{"health":42,"kills":0,"deaths":0,"bestKillingSpree":0,"score":0,"nickname":"Lead Engineer John","killingSpree":0,"headshots":0,"secondsInRound":6,"damageInflicted":0,"bulletsFired":0,"bulletsHit":0,"weaponId":"AK47","team":"blue","damageStats":{"attackingPlayerId":"gpjE8jZgPNseoxfVAAAJ","attackingDamage":58,"attackingHits":2,"weaponId":"AK47"}},"rightArmAngle":-49.72439384669951,"leftArmAngle":-13.724393846699513,"facing":"left"}},"state":"active","map":"HighRuleJungle","gamemode":"TeamDeathmatch","redTeamScore":0,"blueTeamScore":0,"messages":[]}
        const correctPlayerMeta = {"nickname":"Lead Engineer John", "score": "50.0%"}
        assert.deepEqual(getPlayerWithBestAccuracy(room), correctPlayerMeta)
    })
})
