import { assert } from 'chai'

import getPlayerWithBestKillingSpree from './getPlayerWithBestKillingSpree'

describe('getPlayerWithBestKillingSpree', function () {
  it('should return false if there not enough data to calculate stat', function () {
    const room = {
      'players': {
        'VNd8DVD3GMWBlYVsAAAK': {
          'nickname': 'Noob',
          'bestKillingSpree': 0
        },
        'gpjE8jZgPNseoxfVAAAJ': {
          'nickname': 'Master',
          'bestKillingSpree': 0
        }
      }
    }
    assert.equal(getPlayerWithBestKillingSpree(room), false)
  })

  it('should return object if there is enough data to calculate stat', function () {
    const room = {
      'players': {
        'VNd8DVD3GMWBlYVsAAAK': {
          'nickname': 'Noob',
          'bestKillingSpree': 0
        },
        'gpjE8jZgPNseoxfVAAAJ': {
          'nickname': 'Master',
          'bestKillingSpree': 1
        }
      }
    }
    const correctPlayerMeta = {'nickname': 'Master', 'score': 1}
    assert.deepEqual(getPlayerWithBestKillingSpree(room), correctPlayerMeta)
  })
})
