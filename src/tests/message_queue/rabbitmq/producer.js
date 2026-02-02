require('dotenv').config()
const amqp = require('amqplib');
const messages = 'new a product: Title aaaaa';

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-topic'
        await channel.assertQueue(queueName, {
            durable: true
        })

        // send messages to consumer channel
        channel.sendToQueue(queueName, Buffer.from(messages))
        console.log(`message sent: `, messages);
        setTimeout(() =>{
            connection.close();
            process.exit(0);
        }, 500);
    }catch(error){
        console.error(error)
    }
}

runProducer().catch(console.error)