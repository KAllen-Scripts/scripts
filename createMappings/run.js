const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


process.on('message', async (data) => {
    console.log(data)
    if(data.start){
        for(let i = 0; i<=100; i++){
            await sleep(1000)
            if(i % 2 == 0){
                process.send({message:i})  
            } else {
                process.send({warning:i})
            }
        }
        process.exit();
    }
})
