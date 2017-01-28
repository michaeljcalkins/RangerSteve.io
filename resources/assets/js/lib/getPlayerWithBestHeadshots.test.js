import { assert } from 'chai'

import getPlayerWithBestHeadshots from './getPlayerWithBestHeadshots'

describe('getPlayerWithBestHeadshots', function () {
  it('should return false if there not enough data to calculate stat', function () {
    const room = {
      'players': {
        'VNd8DVD3GMWBlYVsAAAK': {
          'nickname': 'Noob',
          'headshots': 0
        },
        'gpjE8jZgPNseoxfVAAAJ': {
          'nickname': 'Master',
          'headshots': 0
        }
      }
    }
    assert.equal(getPlayerWithBestHeadshots(room), false)
  })

  it('should return object if there is enough data to calculate stat', function () {
    const room = {
      'players': {
        'VNd8DVD3GMWBlYVsAAAK': {
          'nickname': 'Noob',
          'headshots': 0
        },
        'gpjE8jZgPNseoxfVAAAJ': {
          'nickname': 'Master',
          'headshots': 3
        }
      }
    }
    const correctPlayerMeta = {'nickname': 'Master', 'score': 3}
    assert.deepEqual(getPlayerWithBestHeadshots(room), correctPlayerMeta)
  })
})
