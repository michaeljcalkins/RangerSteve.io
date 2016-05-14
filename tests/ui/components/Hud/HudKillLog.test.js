import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudKillLog from '../../../../resources/assets/js/ui/components/Hud/HudKillLog'

const props = {
    messages: [
        {
            deadNickname: 'Michael',
            attackerNickname: 'Steve',
            weaponId: 'AK47'
        },
        {
            deadNickname: 'Rob',
            attackerNickname: 'Steve',
            weaponId: 'DesertEagle'
        }
    ]
}

describe('Hud - <HudKillLog />', function() {
    describe('Rendering', function() {
        it('Should render <HudKillLog />', function() {
            let wrapper = shallow(<HudKillLog { ...props } />)
            assert.equal(wrapper.find('li').length, 2)
        })

        it('Should contain kill logs', function() {
            let wrapper = shallow(<HudKillLog { ...props } />)
            assert.equal(wrapper.find('ul').childAt(0).html(), '<li>Steve <img src="AK47.png"/> Michael</li>')
            assert.equal(wrapper.find('ul').childAt(1).html(), '<li>Steve <img src="DesertEagle.png"/> Rob</li>')
        })
    })
})
