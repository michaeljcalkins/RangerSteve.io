export default function () {
  this.hurtBorderSprite = this.game.add.sprite(0, 0, 'hurt-border')
  this.hurtBorderSprite.alpha = 0
  this.hurtBorderSprite.width = window.innerWidth
  this.hurtBorderSprite.height = window.innerHeight
  this.hurtBorderSprite.fixedToCamera = true
}
