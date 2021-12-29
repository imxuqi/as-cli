
import utils from './utils'

utils();

(async function(){
    await new Promise(resolve => setTimeout(resolve,1000))
    console.log('ok')
})()


