module.exports = function (env) {
  try {
    if (['dev', 'prod'].indexOf(env) === -1) {
      throw new Error('\'' + env + "' is not valid env flag.  Please pass '--env dev' or '--env prod'.")
    }
  } catch (e) {
    return console.error(e)
  }

  return require('./webpack/' + env + '.js')({ env: env })
}
