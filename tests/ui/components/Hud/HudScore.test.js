import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudScore from '../../../../resources/assets/js/ui/components/Hud/HudScore'

const props = {
    score: 80
}

describe('Hud - <HudScore />', function() {
    describe('Rendering', function() {
        it('Should render <HudScore />', function() {
            let wrapper = shallow(<HudScore { ...props } />)
            assert.equal(wrapper.find('.hud-score').length, 1)
        })

        it('Should display score', function() {
            let wrapper = shallow(<HudScore { ...props } />)
            assert.equal(wrapper.find('.hud-score').text(), 80)
        })
    })
})
