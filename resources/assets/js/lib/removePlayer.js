export default function(id) {
  if (!window.RS.enemies || window.RS.enemies.length === 0) return;

  const store = this.game.store;
  const room = store.getState().room;

  window.RS.enemies.forEach(player => {
    if (player.data.id !== id) return;
    delete room.players[id];
    player.destroy(true);
  });
}
