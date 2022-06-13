module.exports = {
  cli: {
    name: 'build',
    description: 'Build leapp desktop app',
    version: '0.1',
    arguments: [
      {name: '<target>', choices: ['aot', 'configuration production']},
    ],
  },
  run: async (args) => {
    const path = require('path')
    const shellJs = require('shelljs')
    const copyFunction = require('./copy-func')
    const makeDirFunction = require('./makedir-func')
    const compileFunction = require('./compile-func')
    try {
      await gushio.run(path.join(__dirname, './target-clean.js'))
      console.log('Building leapp... ')

      await makeDirFunction(path, '../dist/leapp-client')
      await copyFunction(path, '../src/assets/icons', '../dist/leapp-client')

      shellJs.exec('npx electron-rebuild -f -w @noovolari/dpapi-addon')

      await compileFunction(path, shellJs, args[0])

      await makeDirFunction(path, '../electron/dist/electron/assets/images')
      await copyFunction(path, '../electron/assets/images', '../electron/dist/electron/assets/images')

      console.log('Build completed successfully')
    } catch (e) {
      e.message = e.message.red
      throw e
    }
  },
}
