const redisPubsubService = require('../services/redisPubsub.service')

class InventoryServiceTest{
    constructor(){
        redisPubsubService.subscribe('purchase_evenet', (channel, message) => {
            const order = JSON.parse(message); 
            InventoryServiceTest.updateInventory(order.productId, order.quantity);
        })
    }
    
    static updateInventory(productId, quantity){
        console.log (`Updated inventory ${productId} with quantity ${quantity}`)
    }
}

module.exports = new InventoryServiceTest()