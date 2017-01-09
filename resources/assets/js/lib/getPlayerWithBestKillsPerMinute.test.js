import { assert } from 'chai'

import getPlayerWithBestKillsPerMinute from './getPlayerWithBestKillsPerMinute'

describe ('getPlayerMetaWithBestAccuracy', function() {
  it('should return false if there not enough data to calculate stat', function() {
    const room = {
      "roundEndTime":1478015007,
      "players":{
        "r5JuqGziUNxw5JOtAAAV": {
          "data":{"kills":0,"secondsInRound":150,"nickname":"Lead Engineer John"}
        },
        "3n7Wyi0c5Q6UFOLIAAAW": {
          "data":{"kills":0,"secondsInRound":16,"nickname":"Whiskey Steve"}
        }
      }
    }

    assert.equal(getPlayerWithBestKillsPerMinute(room), false)
  })

  it('should return object if there is enough data to calculate stat', function() {
    const room = {
      "roundEndTime":1478015007,
      "players":{
        "r5JuqGziUNxw5JOtAAAV": {
          "data":{"kills":1,"secondsInRound":150,"nickname":"Lead Engineer John"}
        },
        "3n7Wyi0c5Q6UFOLIAAAW": {
          "data":{"kills":0,"secondsInRound":16,"nickname":"Whiskey Steve"}
        }
      }
    }

    const correctPlayerMeta = {"nickname":"Lead Engineer John", "score": '0.4'}
    assert.deepEqual(getPlayerWithBestKillsPerMinute(room), correctPlayerMeta)
  })
})
