'user strict'

const { SuccessResponse } = require('../core/success.response')
const {
    createComment,
    deleteComment,
    getCommentByParentId
} = require('../services/comment.service')

class CommentController{
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await createComment(req.body)
        }).send(res)
    }

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'deleteComment',
            metadata: await deleteComment(req.body)
        }).send(res)
    }

    getCommentByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list comment',
            metadata: await getCommentByParentId(req.query)
        }).send(res)
    }
}



module.exports = new CommentController()