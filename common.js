// modules
const axios = require('axios');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const requester = async (method, url, data, attempt = 2, additionalHeaders, reAttempt = true) => {

    let headers = additionalHeaders || {'Content-Type': 'application/json'}
    headers.Authorization = 'Bearer ' + global.accessToken

    let sendRequest = {
        method: method,
        headers: headers,
        url: url,
        data: data
    }

    global.tokens -= 1
    while (global.tokens <= 0){
        await sleep(100)
    }


    return axios(sendRequest)
    
}


async function loopThrough(message, url, params = '', filter = '', callBack, incrementPage = true) {
    let page = 0
    let done = 0;
    let total
    do {
        let res = await requester('get', `${url}?page=${page}&${params}&filter=${filter}`).then(r => {
            total = r.data.metadata.count
            return r.data
        })
        var length = res.data.length
        if(incrementPage){page += 1}
        for (const item of res.data) {
            // If we want to leave the function early, we can return false from the callback
            var continueLoop = await callBack(item)
            done += 1
            if (message != '') {
                process.send({message:`${message} ${done}/${total}`})
            }
            if(continueLoop === false){return}
        }
    } while (length > 0)
}


module.exports = {
    requester,
    sleep,
    loopThrough
};