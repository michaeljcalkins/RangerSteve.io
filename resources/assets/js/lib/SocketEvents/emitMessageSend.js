// @flow
export default function(data: {
  roomId: string,
  playerNickname: string,
  playerId: string,
  message: string,
}) {
    window.socket.emit('message send', data)
}
