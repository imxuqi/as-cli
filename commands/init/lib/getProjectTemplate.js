const request = require('@as/request')

module.exports = function(){
    return request({
        url:'https://static-download.oss-cn-hangzhou.aliyuncs.com/templates.js',
        method:'get'
    })
}