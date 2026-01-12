'use strict'

const ProductService = require("../services/product.service")
const  { SuccessResponse } = require('../core/success.response')
const { product } = require("../models/product.model")

class ProductController{
    
    createProduct = async ( req, res, next) => {
        new SuccessResponse({
            message: 'Create new Product success!',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    // update Product
    updateProduct = async ( req, res, next) => {
        new SuccessResponse({
            message: 'Update Product success!',
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publishProductByShop success!',
            metadata: await ProductService.publishProductByShop(req.body.product_type, {
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)       
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'unPublishProductByShop success!',
            metadata: await ProductService.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)       
    }
    
    // QUERY //
    /**
     * @desc Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return { JSON }
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft success!',
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)  
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish success!',
            metadata: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)  
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Search Product success!',
            metadata: await ProductService.searchProducts(req.params)
        }).send(res)  
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Find All Products success!',
            metadata: await ProductService.findAllProducts(req.query)
        }).send(res)  
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Find Product success!',
            metadata: await ProductService.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)  
    }

    
    // END QUERY //
}

module.exports = new ProductController()