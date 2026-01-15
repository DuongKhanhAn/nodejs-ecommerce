'use strict'

const express = require('express')
const cartController = require('../../controller/cart.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

router.post('', asyncHandler(cartController.addTocart))
router.delete('', asyncHandler(cartController.delete))
router.post('/update', asyncHandler(cartController.update))
router.get('', asyncHandler(cartController.listToCart))

module.exports = router