const axios = require('axios');

const pendingRequests = new Map();
process.on('message', ({ response }) => {
    if (response && pendingRequests.has(response.responseID)) {
        const { resolve, reject } = pendingRequests.get(response.responseID);
        if (response.passed) {
            resolve(response);
        } else {
            reject(response);
        }
        pendingRequests.delete(response.responseID);
    }
});



const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const requester = async (method, url, data, attempt = 2, additionalHeaders, reAttempt = true) => {
    let headers = additionalHeaders || {'Content-Type': 'application/json'};
    headers.Authorization = 'Bearer ' + global.accessToken;
    let sendRequest = {
        method: method,
        headers: headers,
        url: url,
        data: data,
    };

    global.tokens -= 1;
    while (global.tokens <= 0) {
        await sleep(100);
    }

    try {
        const response = await axios(sendRequest);
        let logString = `Request successful: ${response.status} ${response.data.data}`;
        console.log(logString);
        return response;
    } catch (error) {
        let logString;
        if (error.response) {
            logString = `Request failed: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            logString = "Request made but no response received";
        } else {
            logString = `Error setting up request: ${error.message}`;
        }
        console.log(logString);
        throw error;
    }
};


async function loopThrough(message, url, params = '', filter = '', callBack, incrementPage = true) {
    let page = 0
    let done = 0;
    let total
    do {
        let res = await requester('get', `${url}?page=${page}&${params}&filter=${filter}`).then(r => {
            total = r.data.metadata.count
            return r.data
        })
        var pageLength = res.data.length
        if(incrementPage){page += 1}
        for (const item of res.data) {
            var continueLoop = await callBack(item)
            done += 1
            if(continueLoop === false){return}
        }
        if (message != '') {
            await awaitIPCRequest('message', `${message} ${done}/${total}`)
        }
    } while ((pageLength > 0) || (done < total))
}


function awaitIPCRequest(type, request) {
    const requestID = generateUniqueID();
    const message = { [type]: request, requestID };

    return new Promise((resolve, reject) => {
        pendingRequests.set(requestID, { resolve, reject });

        process.send(message, (error) => {
            if (error) {
                console.log(error)
                pendingRequests.delete(requestID);
                reject(error);
            }
        });
    });
}


function generateUniqueID(length = 24) {
    const timestamp = Date.now().toString(36);
    const randomString = Array.from({ length: length - timestamp.length }, () =>
        Math.random().toString(36)[2]
    ).join('');

    return timestamp + randomString;
}

module.exports = {
    requester,
    sleep,
    loopThrough,
    awaitIPCRequest,
    generateUniqueID
};