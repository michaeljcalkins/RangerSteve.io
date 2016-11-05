// @flow
export default function(data: {
  roomId: string,
  damage: number,
  damagedPlayerId: string,
  attackingPlayerId: string,
  weaponId: string,
  wasHeadshot: bool,
}) {
    window.socket.emit('player damaged', data)
}
