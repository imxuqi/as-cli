'use strict';



const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName,registry) {
    if(!npmName){
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registryUrl,npmName)
    console.log(npmInfoUrl)
    return axios.get(npmInfoUrl).then(res => {
        if(res.status === 200){
            return res.data
        }else{
            return null
        }
    }).catch(err => {
        return Promise.reject(err)
    })
}

function getDefaultRegistry(isOriginal = false){
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName,registry){
    const npmInfo = await getNpmInfo(npmName,registry)
    if(npmInfo){
        return Object.keys(npmInfo.versions)
    }else{
        return []
    }
}

function getNpmSemverVersions(baseVersion,versions){
    return versions.filter(v => semver.satisfies(v,`^${baseVersion}`)).sort((a,b) => semver.gt(b,a))
}
async function getNpmSemverVersion(baseVersion,npmName,registry,){
    const versions = await getNpmVersions(npmName,registry)
    const semverVersions = getNpmSemverVersions(baseVersion,versions)
    if(semverVersions && semverVersions.length > 0){
        return semverVersions[0]
    }else{
        return null
    }
}

async function getNpmLatestVersion(npmName,registry){
    const versions = await getNpmVersions(npmName,registry)
    if(versions){
        return versions.sort((a,b) => semver.gt(b,a))[0]
    }
    return null
}

module.exports = {
    getNpmVersions,
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatestVersion
};
