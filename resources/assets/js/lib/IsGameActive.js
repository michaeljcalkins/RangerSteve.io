import _ from 'lodash'

export default function() {
    return ! _.includes(['Boot'], this.game.state.current)
}