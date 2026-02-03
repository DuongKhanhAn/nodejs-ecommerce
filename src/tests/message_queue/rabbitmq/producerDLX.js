const amqp = require('amqplib');
const messages = 'new a product: Title aaaaa';

const log = console.log

console.log = function(){
    log.apply(console, [new Date()].concat(arguments))
}

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:12345@localhost')
        const channel = await connection.createChannel()

        const notificationExchange = 'notificationEx' // notificationEx direct
        const notiQueue = 'notificationQueueProcess' // assertQueue
        const notificationExchangeDLX ='notificationExDLX'
        const notificationRoutingKeyDLX ='notificationRoutingKeyDLX' // assert

        // 1. create Exchange
        await channel.assertExchange(notificationExchange, 'direct', {
            durable: true // true nghia la khi start lai thi queue khong mat message
        })

        // 2. create Queue
        const queueResult = await channel.assertQueue( notiQueue, {
            exclusive: false, // cho phep cac ket noi khac truy cap vao cung 1 luc hang doi
            deadLetterExchange: notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKeyDLX
        })

        // 3. bindQueue
        await channel.bindQueue(queueResult.queue, notificationExchange)

        // 4. Send message
        const msg = 'a new product'
        console.log(`producer msg:: `, msg)
        await channel.sendToQueue(queueResult.queue, Buffer.from(msg),{
            expiration: '10000'
        })
        setTimeout(() =>{
            connection.close();
            process.exit(0);
        }, 500);
    }catch(error){
        console.error(error)
    }
}

runProducer().catch(console.error)