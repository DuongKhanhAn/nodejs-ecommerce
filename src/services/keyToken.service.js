'use strict'

const keytokenModel = require("../models/keytoken.model")

class keyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey }) => {
        try{
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null
        }
        catch (erro) {
            return erro
        }
    }
} 

module.exports = keyTokenService