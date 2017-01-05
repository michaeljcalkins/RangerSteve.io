// @flow

import actions from 'actions'

export default function onAnnouncement(
  announcement: string
) {
  this.game.store.dispatch(actions.room.addAnnouncement(announcement))
}
