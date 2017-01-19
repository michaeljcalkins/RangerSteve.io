import storage from 'store'
import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'
import TeamDeathmatch from './states/TeamDeathmatch'

export default function (store) {
  const useWebgl = storage.get('useWebgl', true)
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

  game.state.start('Boot')

  // Make sure this game instance isn't exposed to clients via window.Phaser.GAMES
  window.Phaser.GAMES[0] = null

  // Force unpausing the game after 1 second to prevent loading screen freeze bug
  // Wrap the arrow function to prevent returning an assignment
  setTimeout(() => { game.paused = false }, 1000)
}
