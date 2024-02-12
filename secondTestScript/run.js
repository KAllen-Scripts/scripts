const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
process.on('message', async (data) => {
    for(let i = 0; i<=10; i++){
        await sleep(1000)
        process.send({message:i})
        if (i==5){throw new Error('')}
    }
    process.exit();
})