import storage from 'store'
import get from 'lodash/get'

import GameConsts from 'lib/GameConsts'
import actions from './actions'
import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'
import TeamDeathmatch from './states/TeamDeathmatch'

export default function (store) {
  const useWebgl = storage.get('useWebgl', GameConsts.USE_WEBGL_BY_DEFAULT)
  let renderer = window.Phaser.AUTO
  if (!useWebgl) renderer = window.Phaser.CANVAS

  const game = new window.Phaser.Game('100%', '100%', renderer, 'game')
  game.store = store

  game.forceSingleUpdate = false

  window.RS = {
    Boot,
    Preloader,
    Deathmatch,
    TeamDeathmatch
  }

  game.state.add('Boot', window.RS.Boot)
  game.state.add('Preloader', window.RS.Preloader)
  game.state.add('Deathmatch', window.RS.Deathmatch)
  game.state.add('TeamDeathmatch', window.RS.TeamDeathmatch)

  // Check if the user is signed in
  window.firebase.auth().onAuthStateChanged(function (auth) {
    // If user is guest just boot the game and a random username will be assigned.
    if (!auth) {
      game.state.start('Boot')
      return
    }

    // If the user is signed in get any info needed here and put it into the redux state
    window.firebase.database()
      .ref('users/' + auth.uid)
      .once('value', (snapshot) => {
        const user = snapshot.val()

        store.dispatch(actions.player.setPlayer({
          uid: auth.uid,
          nickname: get(user, 'username', 'Unnamed Ranger')
        }))

        game.state.start('Boot')
      })
  })

  // Make sure this game instance isn't exposed to clients via window.Phaser.GAMES
  window.Phaser.GAMES[0] = null

  // Force unpausing the game after 5 seconds to prevent loading screen freeze bug
  // Wrap the arrow function to prevent returning an assignment
  setTimeout(() => { game.paused = false }, 5000)
}
