import storage from 'store'
import Boot from './states/Boot'
import Preloader from './states/Preloader'
import Deathmatch from './states/Deathmatch'
import TeamDeathmatch from './states/TeamDeathmatch'

export default function(store) {
  const useWebgl = storage.get('useWebgl', true)
  let renderer = Phaser.AUTO
  if (! useWebgl) renderer = Phaser.CANVAS
  
  const game = new Phaser.Game('100%', '100%', renderer, 'game')
  game.store = store

  game.forceSingleUpdate = false

  window.RS = {
    Boot,
    Preloader,
    Deathmatch,
    TeamDeathmatch,
  }

  game.state.add('Boot', RS.Boot)
  game.state.add('Preloader', RS.Preloader)
  game.state.add('Deathmatch', RS.Deathmatch)
  game.state.add('TeamDeathmatch', RS.TeamDeathmatch)

  game.state.start('Boot')

  // force unpausing the game after 1 second to prevent loading screen freeze bug
  setTimeout(() => game.paused = false, 1000)
}
