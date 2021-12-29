'use strict';

module.exports = core

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists')
const path = require('path')
const commander = require('commander')

const pkg = require('../package.json')
const log = require('@as/log')
const exec = require('@as/exec')
const constant = require('./const');
let config
const program = new commander.Command()

async function core(){
    try {
        await prepare()
        registerCommand()
    } catch (e) {
        log.error(e.message)
        if(program.opts().debug){
            console.log(e)
        }

    }
}


function registerCommand(){
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d,--debug','是否开启调试模式',false)
        .option('-tp,--targetPath <targetPath>','是否指定本地调试文件路径')

    program
        .command('init [projectName]')
        .option('-f,--force','是否强制初始化项目')
        .action(exec)

    // 开启debug模式
    program.on('option:debug',() => {
        if(program.opts().debug){
            process.env.LOG_LEVEL = 'verbose'
        }else{
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
        process.env.DEBUG = program.opts().debug
    })

    // 指定全局的targetPath
    program.on('option:targetPath',() => {
        process.env.CLI_TARGET_PATH = program.opts().targetPath
    })

    // 未知命令监听
    program.on('command:*',(obj) => {
        const availableCommands = program.commands.map(cmd => cmd.name)
        log.warn(colors.red('未知命令' + obj[0]))
        log.info(colors.red('可用命令：' + availableCommands.join(',')))
    })


    if(program.args && program.args.length > 0){
        program.outputHelp()
        // 打印一个空行
        console.log() 
    }else{
        program.parse(process.grgv)
    }
}


async function prepare(){
        checkPkgVersion()
        checkRoot()
        checkUserHome()
        checkEnv()
        await checkUpdate()
}

function checkPkgVersion(){
    log.info('cli', pkg.version);
}





function checkRoot(){
    // root降级
    require('root-check')()
}


function checkUserHome(){
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red(`当前用户主目录不存在`))
    }
}



function checkEnv(){
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome,'.env')
    if(pathExists(dotenvPath)){
        config = dotenv.config({
            path:dotenvPath
        })
    }
    createDefaultConfig()
}


function createDefaultConfig(){
    const cliConfig = {
        home:userHome,
    }
    if(process.env.CLI_HOME){
        cliConfig['cliHome'] = path.join(userHome,process.env.CLI_HOME)
    }else{
        cliConfig['cliHome'] = path.join(userHome,constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
    return cliConfig
}


async function checkUpdate(){
    console.log('check')
    const currentVersion = pkg.version
    const npmName = pkg.name
    const { getNpmSemverVersion } = require('@as/get-npm-info')
    const lastVersion = await getNpmSemverVersion(currentVersion,npmName)
    if(lastVersion && semver.gt(lastVersion,currentVersion)){
        log.warn(`请手动更新${npmName}，当前版本${currentVersion}，最新版本${lastVersion}`)
        log.warn(`更新命令：npm install -g ${npmName}`)
    }
}


