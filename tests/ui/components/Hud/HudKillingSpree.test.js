import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudKillingSpree from '../../../../resources/assets/js/ui/components/Hud/HudKillingSpree'

const props = {
    killingSpreeCount: 3
}

describe('Hud - <HudKillingSpree />', function() {
    describe('Rendering', function() {
        it('Should render <HudKillingSpree />', function() {
            let wrapper = shallow(<HudKillingSpree { ...props } />)
            assert.equal(wrapper.find('.hud-killing-spree').length, 1)
        })
    })

    describe('Messages', function() {
        it('Should not render message', function() {
            let wrapper = shallow(<HudKillingSpree { ...props } />)
            wrapper.setProps({ killingSpreeCount: 0 })
            assert.equal(wrapper.find('.hud-killing-spree').text().length, 0)
        })

        it('Should render TRIPLE KILL', function() {
            let wrapper = shallow(<HudKillingSpree { ...props } />)
            wrapper.setProps({ killingSpreeCount: 3 })
            assert.equal(wrapper.find('.hud-killing-spree').text(), 'TRIPLE KILL')
        })
    })
})
