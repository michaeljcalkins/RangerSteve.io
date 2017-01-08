export default function(data) {
  let rpgExplosion = RS.rpgExplosions.getFirstExists(false)
  if (! rpgExplosion) return console.error('No RPG explosion sprite available.')

  rpgExplosion.reset(data.bulletX, data.bulletY - 50)
  rpgExplosion.anchor.setTo(.5, .5)
  rpgExplosion.animations.play('collision', 17, false, true)

  this.camera.shake(0.01, 200, true)

  this.fx = this.game.add.audio('RPG-explosion-sound')
  this.fx.volume = this.game.store.getState().game.sfxVolume
  this.fx.play()
}
