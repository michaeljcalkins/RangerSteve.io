module.exports = function (wallaby) {
    return {
        files: [
            'app/**/!(*.test).js',
        ],

        tests: [
            'app/**/*.test.js',
        ],

        compilers: {
            '**/*.js': wallaby.compilers.babel(),
        },

        env: {
            type: 'node',
        },
    };
};
