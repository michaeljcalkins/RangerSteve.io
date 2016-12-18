const schemapack = require('schemapack')

module.exports = schemapack.build({
    bulletId: 'varuint',
    bulletSpeed: 'varuint',
    damage: 'uint8',
    playerId: 'string',
    pointerAngle: 'float32',
    weaponId: 'string',
    x: 'varuint',
    y: 'varuint',
})
