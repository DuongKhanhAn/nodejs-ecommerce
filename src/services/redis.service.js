'use strict'


const redis = require('redis')
const { promisify } = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClien()

const pexpire = promisify(redisClient.pexpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setnx).bind(redisClient)

const acquirecLock = async (getProductById, quantity, cartId) => {
    const key = `loack_v2026_${productId}`
    const retryTimes = 10;
    const expireTime = 3000; // 3s tam lock

    for (let i = 0; i < retryTimes.length; i++) {
        // tao mot key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log(`result::`, result)
        if(result === 1){
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                getProductById, quantity, cartId
            })
            if(isReversation.modifiedCount){
                await pexpire(key, expireTime)
                return key
            }
            return null;
        }else{
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
        
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquirecLock,
    releaseLock
}