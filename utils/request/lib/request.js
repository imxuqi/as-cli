'use strict';


const axios = require('axios')


const BASE_URL = process.env.AS_CLI_DEV_BASE_URL


const request = axios.create({
    baseURL:BASE_URL,
    timeout:5000
})

request.interceptors.response.use(
    res => {
        if(res.status === 200){
            return res.data
        }else{
            return res.data
        }
    },
    err => {
        return Promise.reject(err)
    }
)


module.exports = request;
