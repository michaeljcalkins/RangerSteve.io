import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudNewChatMessage from '../../../../resources/assets/js/ui/components/Hud/HudNewChatMessage'

const props = {
    isOpen: false,
    onSendMessage: function() {}
}

describe('Hud - <HudNewChatMessage />', function() {
    describe('Rendering', function() {
        it('Should not render <HudNewChatMessage />', function() {
            let wrapper = shallow(<HudNewChatMessage { ...props } />)
            assert.equal(wrapper.find('textarea').length, 0)
        })

        it('Should render <HudNewChatMessage />', function() {
            let wrapper = shallow(<HudNewChatMessage { ...props } />)
            wrapper.setProps({ isOpen: true })
            assert.equal(wrapper.find('textarea').length, 1)
        })
    })
})
