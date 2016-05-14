import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudKillConfirmed from '../../../../resources/assets/js/ui/components/Hud/HudKillConfirmed'

const props = {
    showKillConfirmed: true
}

describe('Hud - <HudKillConfirmed />', function() {
    describe('Rendering', function() {
        it('Should render <HudKillConfirmed />', function() {
            let wrapper = shallow(<HudKillConfirmed { ...props } />)
            assert.equal(wrapper.find('.hud-kill-confirmed').length, 1)
            assert.equal(wrapper.find('.hud-kill-confirmed').text(), '+10')
        })

        it('Should not display kill confirmed text', function() {
            let wrapper = shallow(<HudKillConfirmed { ...props } />)
            wrapper.setProps({ showKillConfirmed: false })
            assert.equal(wrapper.find('.hud-kill-confirmed').length, 0)
        })
    })
})
