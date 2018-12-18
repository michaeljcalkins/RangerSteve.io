import get from "lodash/get";

import actions from "./actions";
import Boot from "./states/Boot";
import Game from "./states/Game";

export default function(store) {
  const game = new window.Phaser.Game("100%", "100%", window.Phaser.CANVAS, "game");
  game.store = store;

  game.forceSingleUpdate = false;

  window.RS = {
    Boot,
    Game
  };

  game.state.add("Boot", window.RS.Boot);
  game.state.add("Game", window.RS.Game);
  game.state.start("Boot");

  // Make sure this game instance isn't exposed to clients via window.Phaser.GAMES
  window.Phaser.GAMES[0] = null;

  // Force unpausing the game after 5 seconds to prevent loading screen freeze bug
  // Wrap the arrow function to prevent returning an assignment
  setTimeout(() => {
    game.paused = false;
  }, 5000);
}
