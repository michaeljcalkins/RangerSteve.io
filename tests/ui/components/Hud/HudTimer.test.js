import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'
import moment from 'moment'

import HudTimer from '../../../../resources/assets/js/ui/components/Hud/HudTimer'

const props = {
    roundTmer: moment().add(5, 'minutes').unix()
}

describe('Hud - <HudTimer />', function() {
    describe('Rendering', function() {
        it('Should render <HudTimer />', function() {
            let wrapper = shallow(<HudTimer { ...props } />)
            assert.equal(wrapper.find('.hud-timer').length, 1)
        })
    })
})
