const path = require('path')
const webpack = require('@rpgjs/compiler')

const type = process.env.RPG_TYPE || 'mmorpg'
const dir = type == 'mmorpg' ? 'client' : 'standalone'

// Update to bust caches
const version = '0.0.1'

let outputStandalone = {}

if (type != 'mmorpg') {
    outputStandalone = {
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'RPGJS'
    }
}

module.exports = webpack(__dirname, {
    extendClient: {
        output: {
            path: path.join(__dirname, 'dist/' + dir),
            filename: `bundle-${version}.js`,
            ...outputStandalone
        }
    },
    extendServer: {}
})
