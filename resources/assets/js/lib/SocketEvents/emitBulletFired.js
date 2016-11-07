// @flow
import bulletSchema from 'lib/schemas/bulletSchema'

export default function(data: {
    bulletId: string,
    x: number,
    y: number,
    pointerAngle: number,
    bulletSpeed: number,
    damage: number,
    weaponId: string,
    playerId: string,
}) {
    data.playerId = window.SOCKET_ID
    let buffer: Uint8Array = bulletSchema.encode(data)
    window.socket.emit('bullet fired', buffer)
}
