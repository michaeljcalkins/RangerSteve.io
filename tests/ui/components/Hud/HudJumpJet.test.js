import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudJumpJet from '../../../../resources/assets/js/ui/components/Hud/HudJumpJet'

const props = {
    jumpJetCounter: -12600
}

describe('Hud - <HudJumpJet />', function() {
    describe('Rendering', function() {
        it('Should render <HudJumpJet />', function() {
            let wrapper = shallow(<HudJumpJet { ...props } />)
            assert.equal(wrapper.find('.progress-bar').length, 1)
        })

        it('Should display remaning fuel', function() {
            let wrapper = shallow(<HudJumpJet { ...props } />)
            assert.equal(wrapper.find('.progress-bar').html(), '<div class="progress-bar progress-bar-success" style="width:90%;"></div>')
        })
    })
})
