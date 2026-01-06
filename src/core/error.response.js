'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLIC: 409
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLIC: 'Conflict error'
}

class ErrorResponse extends Error {

    constructor(message, status) {
        super(message)
        this.status = status
    }
}

const { StatusCodes } = require('../utils/httpStatusCode')
const {
    statusCodes,
    ReasonPhrases
} = require('../utils/httpStatusCode')

class ConflictRequestError extends ErrorResponse{

    constructor( message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDDEN ){
        super (message, statusCode)
    }
}

class BadRequestError extends ErrorResponse{

    constructor( message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDDEN ){
        super (message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse{

    constructor ( message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED){
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse{

    constructor ( message = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND){
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    NotFoundError,
    AuthFailureError
}