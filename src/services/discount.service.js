'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const {
    convertToObjectIdMongodb,
    updateNestedObjectParser
 } = require('../utils/index')

const { findAllProducts } = require('../models/repositories/product.repo')
const { 
    findAllDiscountCodesSelect, 
    checkDiscountExists, 
    findAllDiscountCodesUnSelect
} = require('../models/repositories/discount.repo')

const discount = require('../models/discount.model')

/*
    Discount Service
    1 - Generator Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User | Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop | Admin]
    6 - Cancel discount code [User]
*/

class DiscountService {
    static async createDiscountCode (payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, users_used, max_uses_per_user
        } = payload
        // kiem tra
        // if(new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError('Discount code has expried!')
        // }
        
        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('Start date must be before end date!')
        }

        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exists!')
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? []: product_ids
        })

        return newDiscount
    }

    // static async updateDiscountCode(discountId, payload) {
    //     const {
    //         start_date, end_date, shopId
    //     } = payload;

    //     // 1. Kiem tra discount co ton tai khong
    //     const foundDiscount = await discount.findOne({
    //         discount_code: code,
    //         discount_shopId: convertToObjectIdMongodb(shopId)
    //     }).lean();

    //     if (!foundDiscount) {
    //         throw new NotFoundError('Discount not found!');
    //     }

    //     // 2. Validate thoi gian co cap nhat ngay
    //     const now = new Date();
    //     const startDate = start_date ? new Date(start_date) : new Date(foundDiscount.discount_start_date);
    //     const endDate = end_date ? new Date(end_date) : new Date(foundDiscount.discount_end_date);

    //     if (startDate >= endDate) {
    //         throw new BadRequestError('Start date must be before end date!');
    //     }

    //     // 3. Xu ly payload de cap nhat
    //     const updateBody = {
    //         discount_name: payload.name,
    //         discount_description: payload.description,
    //         discount_type: payload.type,
    //         discount_value: payload.value,
    //         discount_code: payload.code,
    //         discount_start_date: start_date ? new Date(start_date) : undefined,
    //         discount_end_date: end_date ? new Date(end_date) : undefined,
    //         discount_max_uses: payload.max_uses,
    //         discount_uses_count: payload.uses_count,
    //         discount_max_uses_per_user: payload.max_uses_per_user, 
    //         discount_min_order_value: payload.min_order_value,
    //         discount_is_active: payload.is_active,
    //         discount_applies_to: payload.applies_to,
    //         discount_product_ids: payload.applies_to === 'all' ? [] : payload.product_ids
    //     };

    //     // 4. Loai bo cac truong undefined va parse nested object
    //     const cleanUpdateBody = updateNestedObjectParser(removeUndefinedObject(updateBody));

    //     // 5. Thuc hien cap nhat
    //     return await discount.findByIdAndUpdate(discountId, cleanUpdateBody, {
    //         new: true
    //     });
    // }

    /*
        Get all discount codes available with products
    */

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }){
        // create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean();

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount not exist!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            // get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if(discount_applies_to === 'specific'){
            // get the products ids
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    /*
        get all discount code of shop
    */

    static async getAlldiscountCodesByShop({
        limit, page,
        shopId
    }){
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        
        return discounts
    }
    /*
        Apply Discount Code
        products = {
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },
            {
                productId,
                shopId,
                quantity,
                name,
                price
            }
        }
    */
    static async getDiscountAmount({ codeId, userId, shopId, products }){
        const foundDiscount = await await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)
        
        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user,
            discount_type,
            discount_value,
            discount_users_used,
            discount_min_order_value
        } = foundDiscount

        if(!discount_is_active) throw new NotFoundError(`Discount expried!`)
        if(!discount_max_uses) throw new NotFoundError(`Discount are out!`)

        // if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
        //     throw new NotFoundError(`Discount code has expried!`)
        // }

        // check co set gia tri toi thieu hay khong
        let totalOrder = 0
        if(discount_min_order_value > 0){
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}!`)
            }
        }

        if(discount_max_uses_per_user > 0){
            const userUsesDiscount = discount_users_used.find( user => user.userId === userId)
            if(userUsesDiscount){
                // ....
            }
        }

        // check xem discount nay la fixed_amount
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }){
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }

    /* 
        Cancel Discount Code()
    */
    static async cancelDiscountCode({ codeId, shopId, userId }){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)
        
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },

            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
    }
}

module.exports = DiscountService