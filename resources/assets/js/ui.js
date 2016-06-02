// http://codepen.io/michaeljcalkins/pen/OXPEgV?editors=0010

import React from 'react'
import ReactDOM from 'react-dom'
import GameUiContainer from './ui/containers/GameUiContainer'

export default function() {
    ReactDOM.render(
        <GameUiContainer />,
        document.getElementById('ui-app')
    )
}
