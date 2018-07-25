export default function() {
  const x = Math.round(this.game.input.activePointer.worldX);
  const y = Math.round(this.game.input.activePointer.worldY);
  console.log(`[${x}, ${y}],`);
}
