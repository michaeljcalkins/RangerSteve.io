var admin = require('firebase-admin')

var serviceAccount = require('../rangersteve-5d1fc-firebase-adminsdk-kdrzl-6a5e4f7224.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rangersteve-5d1fc.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'server-side-app'
  }
})

module.exports = admin
