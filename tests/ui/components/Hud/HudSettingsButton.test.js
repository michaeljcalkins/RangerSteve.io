import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'
import sinon from 'sinon'

import HudSettingsButton from '../../../../resources/assets/js/ui/components/Hud/HudSettingsButton'

const props = {
    onButtonClick: sinon.spy()
}

describe('Hud - <HudSettingsButton />', function() {
    describe('Rendering', function() {
        it('Should render <HudSettingsButton />', function() {
            let wrapper = shallow(<HudSettingsButton { ...props } />)
            assert.equal(wrapper.find('.hud-settings').length, 1)
        })
    })

    describe('Simulate Events', function() {
        it('Simulates Open Button Click', function() {
            let wrapper = shallow(<HudSettingsButton { ...props } />)
            wrapper.find('.hud-settings').simulate('click')
            assert.ok(props.onButtonClick.called)
        })
    })
})
