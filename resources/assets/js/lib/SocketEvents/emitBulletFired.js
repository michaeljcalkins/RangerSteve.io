// @flow
export default function(data: {
    bulletId: string,
    x: number,
    y: number,
    pointerAngle: number,
    bulletSpeed: number,
    damage: number,
    weaponId: string,
}) {
    window.socket.emit('bullet fired', data)
}
