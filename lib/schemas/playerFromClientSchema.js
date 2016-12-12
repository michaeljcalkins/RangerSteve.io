const schemapack = require('schemapack')

module.exports = schemapack.build({
    angle: 'float32',
    flying: 'bool',
    shooting: 'bool',
    weaponId: 'string',
    x: 'varuint',
    y: 'varuint',
})
