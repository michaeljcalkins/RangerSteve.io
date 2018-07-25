import storage from 'store'

export default function onSocketDisconnect () {
  storage.set('showIdlePlayerMessage', true)
  document.location.href = '/'
}
