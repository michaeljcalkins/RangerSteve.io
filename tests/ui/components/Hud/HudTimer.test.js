import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'
import moment from 'moment'

import HudTimer from '../../../../resources/assets/js/ui/components/Hud/HudTimer'

const props = {
    roundEndTime: moment().add(4, 'minutes').unix()
}

describe('Hud - <HudTimer />', function() {
    describe('Rendering', function() {
        it('Should render <HudTimer />', function() {
            const wrapper = shallow(<HudTimer { ...props } />)
            assert.equal(wrapper.find('.hud-timer').text(), '4:00')
        })
    })

    describe('Times', function() {
        it('Should render 5:00 when null', function() {
            const wrapper = shallow(<HudTimer { ...props } />)
            wrapper.setProps({ roundEndTime: null })
            console.log('props', wrapper.prop('roundEndTime'))
            assert.equal(wrapper.find('.hud-timer').text(), '5:00')
        })

        it('Should render 0:00 when in the past', function() {
            const wrapper = shallow(<HudTimer { ...props } />)
            const newRoundTmer = moment().subtract(6, 'minutes').unix()
            wrapper.setProps({ roundEndTime: newRoundTmer })
            console.log('props', wrapper.prop('roundEndTime'))
            assert.equal(wrapper.find('.hud-timer').text(), '0:00')
        })
    })
})
