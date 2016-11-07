export default function() {
    const x = this.game.input.activePointer.worldX
    const y = this.game.input.activePointer.worldY
    console.log(`{ x: ${x}, y: ${y} }`)
}
