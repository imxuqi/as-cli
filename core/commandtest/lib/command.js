#! /usr/bin/env node

const commander = require('commander')
const pkg = require('../package.json')




// 调用command单利
// const { program } = commander.program

// 手动实力话
const program = new commander.Command()


program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug','是否开启调试模式',false)
    .option('-e, --envName <envName>','获取环境变量名称')



// commander
const clone = program.command('clone <source> [destination]')
clone
    .description('clonexxxx')
    .option('-f,--force','是否强制拷贝')
    .action((source,destination,cmdObj) => console.log('do action',source,destination,cmdObj.force))


// addCommander
const service = new commander.Command('service')
service
    .command('start [port]')
    .action((port) => {
        console.log('do service at',port)
    })

service
    .command('stop')
    .action(() => {
        console.log('stop service')
    })


program.addCommand(service)


// program
//     .command('install [name]','install xuqi',{
//         executableFile:'as-cli-dev',
//         isDefault:true,
//         hidden:true
//     })
//     .alias('i')



// program
//     .arguments('<cmd> [options]')
//     .description('健康上课上课上课',{
//         cmd:'command to run',
//         options:'slslslsl'
//     })
//     .action((cmd,env) => {
//         console.log(cmd,env)
//     })


// 自定义help
// program.helpInformation = () => {
//     return '颠三倒四的111'
// }
// program.on('--help',() => {
//     console.log('颠三倒四的111111')
// })

program.on('option:debug',() => {
    process.env.LOG_LEVEL = 'verbose'
    console.log(process.env.LOG_LEVEL)
})


// 未知命令监听
program.on('command:*',(obj) => {
    console.log('未知命令' + obj[0])
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log('可用命令' + availableCommands.join(','))
})

program
    .parse(process.argv)




