'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema ({
    order_userId: { type: Number, required: true},
    order_checkout: { type: Object, default: {}},
    /* 
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip    
        }
    */
    order_shipping: { type: Object, default: {}},
   /* 
        street, 
        city,
        state, 
        country
   */
    order_payment: { type: Object, default: {}},
    order_products: { type: Array, required: true},
    order_trackingNumber: { type: String, default: '#0000120012026'},
    order_trackingNumber: { type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'], default: 'pending'}
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifitedOn'
    }
})

// cartSchema.pre('save', function (next) {
//     this.cart_count_product = this.cart_products.length;
//     next();
// });

module.exports = {
    cart: model(DOCUMENT_NAME, orderSchema)
}