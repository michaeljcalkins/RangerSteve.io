// @flow
export default function(data: {
    roomId: string,
    bulletId: string,
    playerId: string,
    x: number,
    y: number,
    pointerAngle: number,
    bulletSpeed: number,
    damage: number,
    weaponId: string,
}) {
    window.socket.emit('bullet fired', data)
}
