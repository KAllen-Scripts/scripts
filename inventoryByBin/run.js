const common = require('../common.js')
global.enviroment = 'api.stok.ly';

process.on('message', async (data) => {
    console.log(data)
    if(data.start){
        global.accessToken = data.accessToken
        await startScript()
        process.exit();
    }

    if(data.replenTokens){
        global.tokens = data.replenTokens
    }

})


async function startScript(){

    let locations = {}
    await common.loopThrough('Getting Bins', `https://${global.enviroment}/v1/inventory-records`, 'size=1000', `[binId]!={UNASSIGNED}`, (record)=>{
        if (record.onHand == 0){return}
        if (!locations[record.locationName]){locations[record.locationName] = []}
        if (!locations[record.locationName][record.itemSku]){locations[record.locationName][record.itemSku] = {
            itemId: record.itemId,
            name: record.itemName,
            [`${record.binName} on Hand`]: record.onHand
        }}
 
    })

    for (const location in locations){

        process.send({output: {
            name: location.replace(/[*?:\/[\]]/g, ''),
            content: locations[location]
        }})
    }
}
