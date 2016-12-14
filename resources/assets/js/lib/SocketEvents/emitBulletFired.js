// @flow
// import bulletSchema from 'lib/schemas/bulletSchema'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

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
    // let buffer: Uint8Array = bulletSchema.encode(data)
    Client.send(GameConsts.EVENT.BULLET_FIRED, data)
}
