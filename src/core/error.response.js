'use strict'

const StatusCode = {
    FORBIDEN: 403,
    CONFLIC: 409
}

const ReasonStatusCode = {
    FORBIDEN: 'Bad request error',
    CONFLIC: 'Conflict error'
}

class ErrorResponse extends Error {

    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse{

    constructor( message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDEN ){
        super (message, statusCode)
    }
}

class BadRequestError extends ErrorResponse{

    constructor( message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDEN ){
        super (message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError
}