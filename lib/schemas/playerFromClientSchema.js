const schemapack = require('schemapack')

module.exports = schemapack.build({
    facing: 'string',
    flying: 'bool',
    leftArmAngle: 'float32',
    rightArmAngle: 'float32',
    shooting: 'bool',
    weaponId: 'string',
    x: 'varuint',
    y: 'varuint',
})
