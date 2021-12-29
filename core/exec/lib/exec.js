'use strict';

module.exports = exec;


const cp = require('child_process')
const Package = require('@as/package')
const log = require('@as/log')
const path = require('path')

const SETTINGS = {
    init:'@as/log'
}

const CACHE_DIR = 'depencencies'


async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storeDir = ''
    let pkg
    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    if(!targetPath){
        targetPath = path.resolve(homePath,CACHE_DIR) // 缓存路径
        storeDir = path.resolve(targetPath,'node_modules')
        log.verbose('targetPath',targetPath)
        log.verbose('storeDir',storeDir)
        pkg = new Package({
            storeDir,
            targetPath,
            packageVersion,
            packageName
        })
        if(await pkg.exists()){
            // 更新package
            await pkg.update()
        }else{
            // 安装package
            await pkg.install()
        }
    }else{
        pkg = new Package({
            targetPath,
            packageVersion,
            packageName
        })
    }
    const rootFile = pkg.getRootFilePath()
    if(rootFile){
        try {
            // 紫禁城调用
            const args = Array.from(arguments)
            const cmd = args[args.length - 1]
            let o = Object.create(null)
            Object.keys(cmd).forEach(key => {
                if(cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent'){
                    o[key] = cmd[key]
                }
            })
            args[args.length - 1] = o
            const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
            const child = spawn('node', ['-e', code], {
                cwd:process.cwd(),
                stdio:'inherit'
            })
            child.on('error',e => {
                log.error(e.message)
                process.exit(1)
            })
            child.on('exit',e => {
                log.verbose('命令执行成功:' + e)
            })
        } catch (err) {
            log.error(err.message)
            if(process.env.LOG_LEVEL === 'verbose'){
                console.log(err)
            }
        }
    }
    
    function spawn(command,args,options){
        const win32 = process.platform === 'win32'
        const cmd = win32 ? 'cmd' : command
        const cmdArgs = win32 ? ['/c'].concat(command,args) : args
        return cp.spawn(cmd,cmdArgs,options || {})
    }
}
