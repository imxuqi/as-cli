const path = require('path')

module.exports = {
    entry:'./bin/core.js',
    output:{
        path:path.join(__dirname,'dist'),
        filename:'core.js'
    },
    mode:'development',
    // mode:'production',
    target:'node'
}