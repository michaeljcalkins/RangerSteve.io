import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import GameUiContainer from './ui/containers/GameUiContainer'

export default function (store) {
  render(
    <Provider store={store}>
      <GameUiContainer />
    </Provider>,
    document.getElementById('ui-app')
  )
}
