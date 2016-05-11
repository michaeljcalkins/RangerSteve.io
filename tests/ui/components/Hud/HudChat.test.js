import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudChat from '../../../../resources/assets/js/ui/components/Hud/HudChat'

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

describe('Hud - <HudChat />', function() {
    describe('Rendering', function() {
        it('Should render <HudChat />', function() {
            let wrapper = shallow(<HudChat { ...props } />)
            assert.equal(wrapper.find('li').length, 2)
        })

        it('Should contain chat messages', function() {
            let wrapper = shallow(<HudChat { ...props } />)
            assert.equal(wrapper.find('ul').childAt(0).text(), 'Michael: Hello world!')
            assert.equal(wrapper.find('ul').childAt(1).text(), 'Rick: Goodbye world!')
        })
    })
})
