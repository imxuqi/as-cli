'use strict';

const  Spinner = require('cli-spinner').Spinner;

function isObject(o){
    return Object.prototype.toString.call(o) === '[object Object]'
}

function getSpinner(message, spinnerString = '|/-\\'){
    const spinner = new Spinner(message + '%s')
    spinner.setSpinnerString(spinnerString)
    return spinner
}


module.exports = {
    isObject, getSpinner
}