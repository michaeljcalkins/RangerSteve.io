export default function() {
  const state = this.game.store.getState()

  // Kill confirmed
  RS.hudKillConfirmed.x = (this.camera.width / 2) - (RS.hudKillConfirmed.width / 2)
  RS.hudKillConfirmed.y = (this.camera.height / 2) - (RS.hudKillConfirmed.height / 2) - 110
  RS.hudKillConfirmed.fixedToCamera = true
  RS.hudKillConfirmed.visible = state.game.showKillConfirmed
}
