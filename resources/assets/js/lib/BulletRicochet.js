export default function(data) {
  const ricochet = window.RS.ricochets.getFirstExists(false);
  if (!ricochet) return console.error("No ricochet sprite available.");

  ricochet.reset(data.bulletX, data.bulletY);
  ricochet.anchor.setTo(0.5, 0.5);
  ricochet.animations.play("collision", 35, false, true);
}
