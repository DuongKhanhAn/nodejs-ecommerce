const redisPubsubService = require('../services/redisPubsub.service')

class ProductServiceTest {
    
    purchaseProduct( productId, quantity ){
        const order = {
            productId,
            quantity
        }
        console.log(`productId`, productId);
        redisPubsubService.publish('purchase_evenet', JSON.stringify(order))
    }
}

module.exports = new ProductServiceTest()