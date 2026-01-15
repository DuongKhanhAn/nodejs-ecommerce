'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { cart } = require("../models/cart.model")
const { getProductById } = require('../models/repositories/product.repo')
const { convertToObjectIdMongodb } = require('../utils/')

/*
    Key features: Cart Service
    - add product to cart [user]
    - reduce product quantity by one [User]
    - increase product quantity by One [User]
    - get cart [User]
    - delete cart [User]
    - delete cart item [User]
*/

class CartService {

    /// START REPO CART ///
    static async createUserCart({ userId, product }){
        const query = { cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            },
            $inc: { cart_count_product: 1 }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate( query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }){
        const { productId, quantity } = product;
        const query = { 
            cart_userId: userId, 
            'cart_products.productId': convertToObjectIdMongodb(productId),
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate( query, updateSet, options)
    }
    /// END REPO CART ///
    static async addToCart({ userId, product = {} }){
        const { productId, quantity } = product;

        // kiem tra san pham co ton tai khong
        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError('Product is not exist!');

        const productData = {
            productId: foundProduct._id,
            shopId: foundProduct.product_shop,
            name: foundProduct.product_name,
            price: foundProduct.product_price,
            quantity: quantity
        };
        // check cart ton tai khong?
        const userCart = await cart.findOne({ cart_userId: userId })
        if(!userCart){
            // create cart for User

            return await CartService.createUserCart({ userId, product: productData })
        }

        // kiem tra san pham co trong gia hang chua
        const existProduct = userCart.cart_products.find(p => p.productId.toString() === productId);
        if (!existProduct) {
            return await cart.findOneAndUpdate(
                { cart_userId: userId, cart_state: 'active' },
                {
                    $push: { cart_products: productData },
                    $inc: { cart_count_product: 1 }
                },
                { new: true }
            )
        }

        // gio hang ton tai va co san pham nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product })
    }

    // update
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */
    static async addToCartV2({ userId, shop_order_ids}){
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
        // check product
        const foundProduct = await getProductById(productId)
        if(!foundProduct) throw new NotFoundError('Product not exsit')
        // compare
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundError('Product do not belong to the shop')
        }
        if(quantity === 0){
            // deleted
            return await CartService.deleteUserCart({ userId, productId });

        }
        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    }

    static async deleteUserCart({ userId, productId }){
        const query = { cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products: {
                    productId: convertToObjectIdMongodb(productId)
                }
            },
            $inc: { cart_count_product: -1 }
        }
        
        const deleteResult = await cart.updateOne( query, updateSet )
        return deleteResult
    }


    static async getListUserCart({ userId }){
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}

module.exports = CartService