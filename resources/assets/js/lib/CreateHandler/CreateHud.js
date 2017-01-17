export default function() {
  // Kill confirmed
  RS.hudKillConfirmed = this.game.add.text(0, 0, '+10', {
    font: "24px Keep Calm",
    fill: "#fff",
  })
  RS.hudKillConfirmed.smoothed = true
  RS.hudKillConfirmed.fixedToCamera = true
  RS.hudKillConfirmed.stroke = '#000'
  RS.hudKillConfirmed.strokeThickness = 3
  RS.hudKillConfirmed.visible = false
}
