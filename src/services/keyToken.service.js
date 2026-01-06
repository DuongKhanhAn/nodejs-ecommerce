'use strict'

const { update } = require("lodash")
const keytokenModel = require("../models/keytoken.model")
const { Types } = require('mongoose')
class keyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try{
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })

            // return tokens ? tokens.publicKey : null

            const filter = { user: userId}, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = { upsert: true, new: true}

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        }
        catch (erro) {
            return erro
        }
    }

    static findByUserId = async ( userId ) => {
        return await keytokenModel.findOne({ user: new Types.ObjectId(userId) }).lean()
    }
    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne( id )
    }
}

module.exports = keyTokenService