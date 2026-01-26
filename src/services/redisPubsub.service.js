const Redis = require('redis');

class RedisPubSubService {

    constructor(){
        this.subscriber = Redis.createClient();
        this.publisher = Redis.createClient();

        this.subscriber.connect().catch(console.error);
        this.publisher.connect().catch(console.error);
    }

    async publish(channel, message) {
        try {
            
            const reply = await this.publisher.publish(channel, message);
            return reply;
        } catch (err) {
            console.error('Publish error:', err);
            throw err;
        }
    }


    async subscribe(channel, callback) {
        try {
            await this.subscriber.subscribe(channel, (message) => {
                callback(channel, message);
            });
            console.log(`Subscribed to channel: ${channel}`);
        } catch (error) {
            console.error(`Subscribe error:`, error);
        }
    }

}

module.exports = new RedisPubSubService()