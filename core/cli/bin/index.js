#! /usr/bin/env node

const importLocal = require('import-local')


if(importLocal(__filename)){
    require('npmlog').info('cli','正在试用as-cli本地版本')
}else{
    require('../lib/core.js')(process.argv.slice(2))
}
