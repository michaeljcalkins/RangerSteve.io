# Setup

1. `yarn install`
2. `webpack --config webpack.dll.js`

# Run locally

1. Start the NodeJS server: `yarn start`
2. Start webpack: `yarn run watch`
3. Use `http://localhost:3001/` to access the app.

Run `yarn start` first because it hijacks the port it's supposed to be proxying.

# Custom GameConsts file for development environment

1. Create a `lib/GameConsts.dev.js` file: `cp lib/GameConsts.example.js lib/GameConsts.dev.js`
2. Use constants from the `lib/GameConsts.js` file to adjust the `lib/GameConsts.dev.js` file
3. The constants from the `lib/GameConsts.dev.js` file overwrite the constants in the `lib/GameConsts.js` file
