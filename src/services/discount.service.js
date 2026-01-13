'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const {
    convertToObjectIdMongodb,
    updateNestedObjectParser
 } = require('../utils/index')
const discount = require('../models/discount.model')
const { findAllProducts } = require('./product.service')
const { findAllDiscountCodesUnSelect } = require('../models/repositories/discount.repo')

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
            type, max_value, max_uses, uses_count, max_uses_per_user
        } = payload
        // kiem tra
        if(new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        throw new BadRequestError('Discount code has expried!')
        }
        
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

    static async updateDiscountCode(discountId, payload) {
        const {
            start_date, end_date, shopId
        } = payload;

        // 1. Kiem tra discount co ton tai khong
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean();

        if (!foundDiscount) {
            throw new NotFoundError('Discount not found!');
        }

        // 2. Validate thoi gian co cap nhat ngay
        const now = new Date();
        const startDate = start_date ? new Date(start_date) : new Date(foundDiscount.discount_start_date);
        const endDate = end_date ? new Date(end_date) : new Date(foundDiscount.discount_end_date);

        if (startDate >= endDate) {
            throw new BadRequestError('Start date must be before end date!');
        }

        // 3. Xu ly payload de cap nhat
        const updateBody = {
            discount_name: payload.name,
            discount_description: payload.description,
            discount_type: payload.type,
            discount_value: payload.value,
            discount_code: payload.code,
            discount_start_date: start_date ? new Date(start_date) : undefined,
            discount_end_date: end_date ? new Date(end_date) : undefined,
            discount_max_uses: payload.max_uses,
            discount_uses_count: payload.uses_count,
            discount_max_uses_per_use: payload.max_uses_per_user, 
            discount_min_order_value: payload.min_order_value,
            discount_is_active: payload.is_active,
            discount_applies_to: payload.applies_to,
            discount_product_ids: payload.applies_to === 'all' ? [] : payload.product_ids
        };

        // 4. Loai bo cac truong undefined va parse nested object
        const cleanUpdateBody = updateNestedObjectParser(removeUndefinedObject(updateBody));

        // 5. Thuc hien cap nhat
        return await discount.findByIdAndUpdate(discountId, cleanUpdateBody, {
            new: true
        });
    }

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

        if(!foundDiscount || foundDiscount.discount_is_active){
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
                discount_is_active
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        
        return discounts
    }
}