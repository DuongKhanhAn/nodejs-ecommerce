'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const keyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")


const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /* 
        check this token used?
    */

    static handlerRefreshToken = async( refreshToken ) => {
        // check token da duoc su dung?
        const foundToken = await keyTokenService.findByRefreshToKenUsed( refreshToken)
        // co
        if(foundToken){
            // decode xem la ai?
            const { userId, email } = await verifyJWT (refreshToken, foundToken.privateKey)
            console.log({userId, email})
            // xoa tat ca token trong keyStore
            await keyTokenService.deleteKeyById(userId)
            throw new ForbiddenError(' Something wrong happened!!! Please relogin')
        }

        // khong
        const holderToken = await keyTokenService.findByRefreshToKen( refreshToken )
        if(!holderToken) throw new AuthFailureError('Shop not registered 1')

        // verifyToken
        const { userId, email } = await verifyJWT (refreshToken, holderToken.privateKey)
        console.log('[2]-- ', {userId, email})

        // check UserId
        const foundShop = await findByEmail( {email} )
        if(!foundShop) throw new AuthFailureError('Shop not registered 2')

        // create 1 cap moi
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await keyTokenService.removeKeyById(keyStore._id)
        console.log( {delKey})
        return delKey
    }

    /* 
        1 - Check email in dbs
        2 - match password
        3 - create AT vs RT and save
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        
        //1.
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered')
        
        //2.
        const match = await bcrypt.compare( password, foundShop.password )
        if(!match) throw new AuthFailureError('Authentication error')

        //3.
        // create privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        const { _id: userId} = foundShop

        //4. generate tokens
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)
        
        await keyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey,
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {

            const holderShop = await shopModel.findOne({ email }).lean()

            if(holderShop){
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop){
                // created privateKey, publicKey 

                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')


                console.log({ privateKey, publicKey }) // save collection KeyStore
                const keyStore = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore){
                    //throw new BadRequestError('Error: Shop already registered!')
                    return {
                        code: 'xxxx',
                        message: 'keyStore error'
                    }
                }

                // created token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                // console.log(`Created Token Success::`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
                //const tokens = await
            }
            return {
                code: 200,
                metadata: null
            }
        // } catch (error) {
        //     console.error(error)
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService