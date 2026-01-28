'use strict'

const express = require('express')
const NotificationController = require('../../controller/notification.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
// Here not login


// authentication
router.use(authentication)

/////////////////////
router.get('', asyncHandler(NotificationController.listNotiByUser))
// QUERY //

module.exports = router