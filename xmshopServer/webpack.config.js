const fs = require("fs")

let nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {

    entry: [
        './app.js',
    ],
    output: {
        path: __dirname,
        filename: 'XMShopServer.js',
    },
    target: 'node', // 指定为nodejs环境
    externals: nodeModules, // 声明npm模块
    context: __dirname,
    node: { // 路径指定
        __filename: false,
        __dirname: false
    },
}