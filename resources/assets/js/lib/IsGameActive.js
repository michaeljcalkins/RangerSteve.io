import _ from 'lodash'

export default function() {
    return ! _.includes(['Boot', 'Preloader'], this.game.state.current)
}