import React from 'react'
import { shallow } from 'enzyme'
import { assert } from 'chai'

import HudLeaderboard from '../../../../resources/assets/js/ui/components/Hud/HudLeaderboard'

const props = {
    players: {}
}

describe('Hud - <HudLeaderboard />', function() {
    describe('Rendering', function() {
        it('Should render <HudLeaderboard />', function() {
            let wrapper = shallow(<HudLeaderboard { ...props } />)
            assert.equal(wrapper.find('.hud-leaderboard').length, 1)
            assert.equal(wrapper.find('.hud-leaderboard').find('tr').length, 0)
        })

        it('Should render players in order of score', function() {
            let wrapper = shallow(<HudLeaderboard { ...props } />)
            wrapper.setProps({
                players: [
                    { meta: { nickname: 'Rick', score: 100 } },
                    { meta: { nickname: 'Steve', score: 340 } },
                    { meta: { nickname: 'Mike', score: 20 } }
                ]
            })

            assert.equal(wrapper.find('.hud-leaderboard').find('tbody').childAt(0).childAt(1).text(), '340')
            assert.equal(wrapper.find('.hud-leaderboard').find('tbody').childAt(1).childAt(1).text(), '100')
            assert.equal(wrapper.find('.hud-leaderboard').find('tbody').childAt(2).childAt(1).text(), '20')
        })
    })
})
