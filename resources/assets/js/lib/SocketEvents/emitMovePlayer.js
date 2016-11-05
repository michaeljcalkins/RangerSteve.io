// @flow
export default function(data: {
  roomId: string,
  x: number,
  y: number,
  rightArmAngle: number,
  leftArmAngle: number,
  facing: string,
  flying: bool,
  // shooting: bool
}) {
    window.socket.emit('move player', data)
}
