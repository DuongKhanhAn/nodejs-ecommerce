'use strict'

const express = require('express')
const commentController = require('../../controller/comment.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

// authentication
router.use(authentication)

/////////////////////
router.post('', asyncHandler(commentController.createComment))
router.delete('', asyncHandler(commentController.deleteComment))
router.get('', asyncHandler(commentController.getCommentByParentId))
// QUERY //

module.exports = router