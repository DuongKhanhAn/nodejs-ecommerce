'use strict'

const { update } = require("lodash")
const keytokenModel = require("../models/keytoken.model")

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
} 

module.exports = keyTokenService