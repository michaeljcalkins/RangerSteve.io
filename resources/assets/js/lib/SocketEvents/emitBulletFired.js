// import bulletSchema from 'lib/schemas/bulletSchema'
import GameConsts from 'lib/GameConsts'
import Client from '../Client'

export default function (data) {
    // let buffer: Uint8Array = bulletSchema.encode(data)
  Client.send(GameConsts.EVENT.BULLET_FIRED, data)
}
