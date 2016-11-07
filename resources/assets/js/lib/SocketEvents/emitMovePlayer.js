// @flow
import playerFromClientSchema from '../../../../../lib/schemas/playerFromClientSchema'

export default function(data: {
    facing: string,
    flying: bool,
    leftArmAngle: number,
    rightArmAngle: number,
    shooting: bool,
    weaponId: string,
    x: number,
    y: number,
}) {
    var buffer = playerFromClientSchema.encode(data)
    window.socket.emit('move player', buffer)
}
