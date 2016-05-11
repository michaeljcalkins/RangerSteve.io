import { assert } from 'chai'

import Percent from '../../resources/assets/js/lib/RemainingFuelPercent'

describe('RemainingFuelPercent', function() {
    it('Should return correct percentage', function() {
        assert.equal(Percent(0), 100)
        assert.equal(Percent(-102000), 22)
        assert.equal(Percent(-50000, 100000), 50)
    })
})
