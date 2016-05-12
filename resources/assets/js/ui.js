import React from 'react'
import ReactDOM from 'react-dom'
import GameUiContainer from './ui/containers/GameUiContainer'

export default function() {
    const element = document.getElementById('ui-app')

    ReactDOM.render(
        <GameUiContainer />,
        element
    )
}
