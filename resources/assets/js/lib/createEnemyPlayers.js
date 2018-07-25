import createRemotePlayer from "./createRemotePlayer";

export default function createEnemyPlayers() {
  const state = this.game.store.getState();
  Object.keys(state.room.players).forEach(playerId => {
    if (playerId === window.SOCKET_ID) return;
    const newCreateRemotePlayer = createRemotePlayer.call(
      this,
      playerId,
      state.room.players[playerId]
    );
    window.RS.enemies.add(newCreateRemotePlayer);
    this.game.world.bringToTop(window.RS.enemies);
  });
}
