module.exports = function (wallaby) {
  return {
    files: [
      'app/**/!(*.test).js',
      'resources/assets/**/!(*.test).js',
      'lib/**/!(*.test).js'
    ],

    tests: [
      'app/**/*.test.js',
      'resources/assets/**/*.test.js',
      'lib/**/*.test.js'
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node'
    }
  }
}
