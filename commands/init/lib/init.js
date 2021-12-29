'use strict';


const Command = require('@as/command')
const log = require('@as/log')
const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const path = require('path')
const getProjectTemplate = require('./getProjectTemplate');
const Package = require('../../../core/exec/node_modules/@as/package/lib/package');




const TYPE_COMPONENT = 'component'
const TYPE_PROJECT = 'project'

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || ''
        this.force = !!this._cmd.force
        log.verbose('projectName', this.projectName)
        log.verbose('force', this.force)
    }


    async exec() {
        try {
            // 1、准备阶段
            const projectInfo = await this.prepare()
            if(projectInfo){
                this.projectInfo = projectInfo
                log.verbose('projectInfo',projectInfo)
                // 2、下载模版
                await this.downloadTemplate()
            }
            // 3、安装模版
        } catch (e) {
            log.error(e.message)
        }
    }

    async downloadTemplate(){
        const { projectTemplate } = this.projectInfo;
        // templates = [{
        //     "name" : "Vue3标准模板",
        //     "npmName" : "as-cli-dev-template-vue3",
        //     "version" : "^1.0.0"
        // },{
        //     "name" : "Vue2后台管理模板",
        //     "npmName" : "as-cli-dev-template-vue-element-admin",
        //     "version" : "^1.0.0"
        // }]
        const templateInfo = this.templates.find(item => item.npmName === projectTemplate)
        const targetPath = process.env.CLI_HOME_PATH
        const storeDir = path.resolve(targetPath,'node_modules')
        const pkg = new Package({
            targetPath,storeDir,packageName:templateInfo.npmName,packageVersion:templateInfo.version
        })
        const getSpinner = require('@as/utils').getSpinner
        if(!await pkg.exists()){
            const spinner = getSpinner('正在下载模板')
            spinner.start()
            await pkg.install()
            spinner.stop(true)
            log.success('模版下载成功')
        }else{
            const spinner = getSpinner('正在更新模板')
            spinner.start()
            await pkg.update()
            spinner.stop(true)
            log.success('模版更新成功')
        }
        
    }

    async prepare() {
        // 0、判断项目模板是否存在
        const templates = await getProjectTemplate()
        if(!templates || templates.length === 0){
            throw new Error('模板不存在')
        }
        this.templates = templates
        // 1、当前目录是否为空
        const localPath = process.cwd()
        if (!this.isCwdEmpty(localPath)) {
            // 1.1 询问是否继续创建
            const { isContinue } = await inquirer.prompt({
                type: 'confirm',
                name: 'isContinue',
                default: false,
                message: '当前目录不为空，是否继续'
            })
            // 2、是否启动强制更新
            if (isContinue) {
                // 二次确认
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '确认要清空此文件夹吗'
                })
                if (confirmDelete) {
                    fse.emptyDirSync(localPath)
                }
            }else {
                return
            }
        }
        // 3、选择项目或组件
        // 4、获取项目基本信息
        // return 项目基本信息(obj)
        return await this.getProjectInfo()
    }

    async getProjectInfo() {
        // 1、项目还是组件
        // 2、项目名称
        // 3、版本号
        let projectInfo = {}
        const { type } = await inquirer.prompt({
            message: '请选择初始化类型',
            name: 'type',
            type: 'list',
            default: TYPE_PROJECT,
            choices: [
                { name: '项目', value: TYPE_PROJECT },
                { name: '组件', value: TYPE_COMPONENT }
            ],
            
        })
        if (type === TYPE_PROJECT) {
            // 获取项目信息
            const o = await inquirer.prompt([{
                    message: '请输入项目名称',
                    name: 'name',
                    type: 'input',
                    validate: function(v){
                        // 1、首字符必须为英文
                        // 2、尾字符必须为英文或数字
                        // 3、'-_'连接
                        const done = this.async()
                        if(!/^[a-zA-Z]+[\w-]*[a-zA-Z0-9]+$/.test(v)){
                            done('请输入合法的项目名称')
                        }else{
                            done(null,true)
                        }
                    },
                    filter: v => v
                }, {
                    message:'请输入项目版本号',
                    name:'version',
                    type:'input',
                    default:'1.0.0',
                    validate: function(v){
                        // 是否合法版本号
                        const done = this.async()
                        if(!!!semver.valid(v)){
                            done('请输入合法的版本号')
                            return
                        }
                        return done(null,true)
                    },
                    filter: v => {
                        if(!!semver.valid(v)){
                            return semver.valid(v)
                        }else{
                            return v
                        }
                    }
                }, {
                    message:'请选择项目模板',
                    name:'projectTemplate',
                    type:'list',
                    choices:this.createTemplateChoice()
                }])
                projectInfo = {
                    type,
                    ...o
                }
        } else if (type === TYPE_COMPONENT) {

        }
        return projectInfo
    }

    createTemplateChoice(){
        return this.templates.map(item => ({
            name:item.name,
            value:item.npmName
        }))
    }

    isCwdEmpty(localPath) {
        let fileList = fs.readdirSync(localPath)
        // 文件过滤逻辑
        // .开头
        // node_modules
        fileList = fileList.filter(file => {
            return !file.startsWith('.') && (['node_modules'].indexOf(file) < 0)
        })
        return !fileList || fileList.length <= 0
    }
}


function init(argv) {
    return new InitCommand(argv)
}


module.exports = init
module.exports.InitCommand = InitCommand