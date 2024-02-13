const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


process.on('message', async (data) => {
    console.log(data)
    if(data.start){
        for(let i = 0; i<=100; i++){
            if(i < 5){await sleep(1000)}
            process.send({message:i})
        }
        process.exit();
    }
})
