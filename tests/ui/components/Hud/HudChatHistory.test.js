import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudChatHistory from '../../../../resources/assets/js/ui/components/Hud/HudChatHistory'

const props = {
    messages: [
        {
            playerNickname: 'Michael',
            message: 'Hello world!'
        },
        {
            playerNickname: 'Rick',
            message: 'Goodbye world!'
        }
    ]
}

describe('Hud - <HudChatHistory />', function() {
    describe('Rendering', function() {
        it('Should render <HudChatHistory />', function() {
            let wrapper = shallow(<HudChatHistory { ...props } />)
            assert.equal(wrapper.find('li').length, 2)
        })

        it('Should contain chat messages', function() {
            let wrapper = shallow(<HudChatHistory { ...props } />)
            assert.equal(wrapper.find('ul').childAt(0).text(), 'Michael: Hello world!')
            assert.equal(wrapper.find('ul').childAt(1).text(), 'Rick: Goodbye world!')
        })
    })
})
