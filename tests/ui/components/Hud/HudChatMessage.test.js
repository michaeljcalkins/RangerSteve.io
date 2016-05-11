import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudChatMessage from '../../../../resources/assets/js/ui/components/Hud/HudChatMessage'

const props = {
    isOpen: false,
    onSendMessage: function() {}
}

describe('Hud - <HudChatMessage />', function() {
    describe('Rendering', function() {
        it('Should not render <HudChatMessage />', function() {
            let wrapper = shallow(<HudChatMessage { ...props } />)
            assert.equal(wrapper.find('textarea').length, 0)
        })

        it('Should render <HudChatMessage />', function() {
            const newProps = Object.assign(props, { isOpen: true })
            let wrapper = shallow(<HudChatMessage { ...newProps } />)
            assert.equal(wrapper.find('textarea').length, 1)
        })
    })
})
