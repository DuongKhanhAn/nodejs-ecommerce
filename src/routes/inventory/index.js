'use strict'

const express = require('express')
const inventoryController = require('../../controller/inventory.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

router.use(authentication)
router.post('', asyncHandler(inventoryController.add))


module.exports = router