'use strict';

const path = require('path')
const fse = require('fs-extra')
const pathExists = require('path-exists').sync
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const formatPath = require('@as-cli/format-path')
const { getDefaultRegistry, getNpmLatestVersion }  = require('@as-cli/get-npm-info')
const { isObject } = require('@as-cli/utils')

class Package{
    constructor(options){
        if(!options || !isObject(options)){
            throw new Error('Package类的options参数不能为空')
        }
        if(!isObject(options)){
            throw new Error('Package类的options参数必须是对象')
        }
        // package路径
        this.targetPath = options.targetPath
        // package的name
        this.packageName = options.packageName
        // version
        this.packageVersion = options.packageVersion
        // 缓存package路径
        this.storeDir = options.storeDir
        // 缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/','_')
    }

    async prepare(){
        if( this.storeDir && !pathExists(this.storeDir)){
            fse.mkdirpSync(this.storeDir)
        }
        if(this.packageVersion === 'latest'){
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }

    get cacheFilePath(){
        return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }
    

    getSpecificCacheFilePath(packageVersion){
        return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
    }

    // 判断当前package是否存在
    async exists(){
        if(this.storeDir){
            await this.prepare()
            return pathExists(this.cacheFilePath)
        }else{
            return pathExists(this.targetPath)
        }
    }
    // 安装package
    install(){
        this.prepare()
        return npminstall({
            root:this.targetPath,
            storeDir:this.storeDir,
            registry:getDefaultRegistry(),
            pkgs:[{ 
                name:this.packageName,
                version:this.packageVersion
            }]
        })
    }
    // 更新package
    async update(){
        await this.prepare()
        // 1. 获取最新版本号
        const latestVersion = await getNpmLatestVersion(this.packageName)
        const latestFilePath = this.getSpecificCacheFilePath(latestVersion)
        // 2. 最新版本号对应路径是否存在
        // 3. 如果不存在，直接安装新版本
        if(!pathExists(latestFilePath)){
            await npminstall({
                root:this.targetPath,
                storeDir:this.storeDir,
                registry:getDefaultRegistry(),
                pkgs:[{ 
                    name:this.packageName,
                    version:latestVersion
                }]
            })
        }
        this.packageVersion = latestVersion
    }
    
    // 获取入口文件路径
    getRootFilePath(){
        // 1. 获取package.json所在目录 - pkg.dir
        // 2. 读取package.json - require() js/json/node
        // 3. main/lib - path
        // 4. 路径的兼容（mac/windows）
        if(this.storeDir){
            return _getRootFilePath(this.cacheFilePath)
        }else{
            return _getRootFilePath(this.targetPath)
        }
        function _getRootFilePath(targetPath){
            const dir = pkgDir(targetPath)
            if(dir){
                const pkg = require(path.resolve(dir,'package.json'))
                if(pkg && pkg.main){
                    return formatPath(path.resolve(dir,pkg.main))
                }
            }else{
                return null
            }
        }
    }
}

module.exports = Package;
