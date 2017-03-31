import get from 'lodash/get'

import actions from './actions'
import Boot from './states/Boot'
import Game from './states/Game'

export default function (store) {
  const game = new window.Phaser.Game('100%', '100%', window.Phaser.CANVAS, 'game')
  game.store = store

  game.forceSingleUpdate = false

  window.RS = {
    Boot,
    Game
  }

  game.state.add('Boot', window.RS.Boot)
  game.state.add('Game', window.RS.Game)

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

        window.firebase.database()
          .ref('user_transactions/' + auth.uid)
          .once('value', function (snapshot) {
            let transactions = snapshot.val()

            if (transactions) {
              var premiumTransactions = Object.keys(transactions)
                .filter(function (key) {
                  return transactions[key].type === 'premium'
                })

              store.dispatch(actions.player.setPlayer({
                isPremium: premiumTransactions.length > 0
              }))
            }

            game.state.start('Boot')
          })
      })
  })

  // Make sure this game instance isn't exposed to clients via window.Phaser.GAMES
  window.Phaser.GAMES[0] = null

  // Force unpausing the game after 5 seconds to prevent loading screen freeze bug
  // Wrap the arrow function to prevent returning an assignment
  setTimeout(() => { game.paused = false }, 5000)
}
