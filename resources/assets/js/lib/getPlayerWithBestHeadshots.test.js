import { assert } from 'chai'

import getPlayerWithBestHeadshots from './getPlayerWithBestHeadshots'

describe('getPlayerMetaWithBestAccuracy', function() {
    it('should return false if there not enough data to calculate stat', function() {
        const room = {"roundEndTime":1478015007,"id":"honest-penguin-9","players":{"r5JuqGziUNxw5JOtAAAV":{"x":3869.513888888903,"y":714,"id":"r5JuqGziUNxw5JOtAAAV","data":{"health":100,"kills":1,"deaths":0,"bestKillingSpree":1,"score":10,"nickname":"Lead Engineer John","killingSpree":1,"headshots":0,"secondsInRound":150,"damageInflicted":44,"bulletsFired":9,"bulletsHit":3,"weaponId":"AK47","team":null,"accuracy":"33.3","killsPerMinute":"0.4"},"rightArmAngle":89.66097916255308,"leftArmAngle":95.66097916255308,"facing":"right"},"3n7Wyi0c5Q6UFOLIAAAW":{"x":1940,"y":374.16666666666663,"id":"3n7Wyi0c5Q6UFOLIAAAW","data":{"health":100,"kills":0,"deaths":1,"bestKillingSpree":0,"score":0,"nickname":"Whiskey Steve","killingSpree":0,"headshots":0,"secondsInRound":16,"damageInflicted":0,"bulletsFired":0,"bulletsHit":0,"weaponId":"AK47","team":null,"damageStats":{"attackingPlayerId":null,"attackingDamage":0,"attackingHits":0,"weaponId":"AK47"},"canRespawnTimestamp":1478014859},"rightArmAngle":3.3876798268755692,"leftArmAngle":-73.61232017312443,"facing":"right"}},"state":"active","map":"PunkCity","gamemode":"Deathmatch","redTeamScore":0,"blueTeamScore":0,"messages":[]}
        assert.equal(getPlayerWithBestHeadshots(room), false)
    })

    it('should return object if there is enough data to calculate stat', function() {
        const room = {"roundEndTime":1478015007,"id":"honest-penguin-9","players":{"r5JuqGziUNxw5JOtAAAV":{"x":3869.513888888903,"y":714,"id":"r5JuqGziUNxw5JOtAAAV","data":{"health":100,"kills":1,"deaths":0,"bestKillingSpree":1,"score":10,"nickname":"Lead Engineer John","killingSpree":1,"headshots":3,"secondsInRound":150,"damageInflicted":44,"bulletsFired":9,"bulletsHit":3,"weaponId":"AK47","team":null,"accuracy":"33.3","killsPerMinute":"0.4"},"rightArmAngle":89.66097916255308,"leftArmAngle":95.66097916255308,"facing":"right"},"3n7Wyi0c5Q6UFOLIAAAW":{"x":1940,"y":374.16666666666663,"id":"3n7Wyi0c5Q6UFOLIAAAW","data":{"health":100,"kills":0,"deaths":1,"bestKillingSpree":0,"score":0,"nickname":"Whiskey Steve","killingSpree":0,"headshots":0,"secondsInRound":16,"damageInflicted":0,"bulletsFired":0,"bulletsHit":0,"weaponId":"AK47","team":null,"damageStats":{"attackingPlayerId":null,"attackingDamage":0,"attackingHits":0,"weaponId":"AK47"},"canRespawnTimestamp":1478014859},"rightArmAngle":3.3876798268755692,"leftArmAngle":-73.61232017312443,"facing":"right"}},"state":"active","map":"PunkCity","gamemode":"Deathmatch","redTeamScore":0,"blueTeamScore":0,"messages":[]}
        const correctPlayerMeta = {"nickname":"Lead Engineer John", "score": 3}
        assert.deepEqual(getPlayerWithBestHeadshots(room), correctPlayerMeta)
    })
})
