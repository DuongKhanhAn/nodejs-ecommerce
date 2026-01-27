'user strict'

const { SuccessResponse } = require('../core/success.response')
const {
    createComment,
    getCommentByParentId
} = require('../services/comment.service')

class CommentController{
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await createComment(req.body)
        }).send(res)
    }

    getCommentByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await getCommentByParentId(req.query)
        }).send(res)
    }
}



module.exports = new CommentController()