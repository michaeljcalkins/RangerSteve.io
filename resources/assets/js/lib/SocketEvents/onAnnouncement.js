import actions from 'actions'

export default function onAnnouncement(announcement) {
  this.game.store.dispatch(actions.room.addAnnouncement(announcement))
}
