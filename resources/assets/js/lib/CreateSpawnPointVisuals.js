import GameConsts from "lib/GameConsts";

export default function(spawnPoints) {
  spawnPoints.forEach(pos => {
    var width = GameConsts.PLAYER_BODY_WIDTH;
    var height = GameConsts.PLAYER_BODY_HEIGHT;
    var bmd = this.game.add.bitmapData(width, height);

    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, width, height);
    bmd.ctx.fillStyle = "#ffffff";
    bmd.ctx.fill();
    const square = this.game.add.sprite(pos.x, pos.y, bmd);
    square.anchor.set(0.5, 0);

    let style = {
      font: "10px Arial",
      fill: "#000"
    };
    let text = this.game.add.text(
      pos.x,
      pos.y,
      `x: ${pos.x}, y: ${pos.y}`,
      style
    );
    text.anchor.set(0.5, 0);
    text.smoothed = true;
  });
}
