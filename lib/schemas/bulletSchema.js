import schemapack from 'schemapack'

module.exports = schemapack.build({
    bulletId: 'string',
    x: 'varuint',
    y: 'varuint',
    pointerAngle: 'float32',
    bulletSpeed: 'varuint',
    playerId: 'string',
    damage: 'uint8',
    weaponId: 'string',
})