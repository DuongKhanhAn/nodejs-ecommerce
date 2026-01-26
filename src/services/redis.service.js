'use strict'

const redis = require('redis')
const { reservationInventory } = require('../models/repositories/inventory.repo')

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
})

redisClient.connect()
    .then(() => console.log('Connected to Redis successfully'))
    .catch(err => console.error('Redis Connection Error', err))

redisClient.on('error', (err) => console.log('Redis Client Error', err))

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2026_${productId}`
    const retryTimes = 10
    const expireTime = 3000  // 3s tam lock

    for (let i = 0; i < retryTimes; i++) {
        // tao mot key, thang nao nam giu duoc vao thanh toan
        const result = await redisClient.set(key, 'lock_value', {
            NX: true,
            PX: expireTime
        })

        if (result === 'OK') {
            // thao tac voi inventory
            const isReservation = await reservationInventory({
                productId, quantity, cartId
            })

            if (isReservation.modifiedCount) {
                return key
            }

            await redisClient.del(key)
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async (keyLock) => {
    return await redisClient.del(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}