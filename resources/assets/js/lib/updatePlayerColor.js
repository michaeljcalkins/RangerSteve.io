const playerColors = {
  blue: 0x2578FF,
  red: 0xFF2525
}

export default function (player, color) {
  player.playerSprite.tint = playerColors[color]
  player.leftArmSprite.tint = playerColors[color]
  player.rightArmSprite.tint = playerColors[color]
}
