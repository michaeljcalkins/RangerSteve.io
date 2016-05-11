import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudHealth from '../../../../resources/assets/js/ui/components/Hud/HudHealth'

const props = {
    health: 87
}

describe('Hud - <HudHealth />', function() {
    describe('Rendering', function() {
        it('Should render <HudHealth />', function() {
            let wrapper = shallow(<HudHealth { ...props } />)
            assert.equal(wrapper.find('.hud-health').length, 1)
        })

        it('Should display health', function() {
            let wrapper = shallow(<HudHealth { ...props } />)
            assert.equal(wrapper.find('.hud-health').text(), 87)
        })
    })
})
