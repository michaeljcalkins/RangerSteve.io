const playerColors = {
  blue: 0x2578ff,
  red: 0xff2525
};

export default function(player, color) {
  player.playerSprite.tint = playerColors[color];
  player.leftArmSprite.tint = playerColors[color];
  player.rightArmSprite.tint = playerColors[color];
}
