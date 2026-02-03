'use strict'

const { Client, GatewayIntentBits } = require('discord.js')

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        })

        this.channelId = process.env.CHANNELID_DISCORD
        const token = process.env.TOKEN_DISCORD

        this.client.on('clientReady', () => {
            console.log(`Logged in as ${this.client.user.tag}`)
        })

        this.client.on('messageCreate', msg => {
            if(msg.author.bot) return;
            if(msg.content === 'hello'){
                msg.reply(`Hello! How can I assits you today!`)
            }
        })

        if (token) {
            this.client.login(token).catch(console.error)
        }
    }

    sendToFormatCode(logData) {
        const { 
            code, 
            message = 'Thông tin bổ sung về mã lỗi.', 
            title = 'Code Example' 
        } = logData;

        const isProduction = process.env.NODE_ENV === 'production';
        const embedColor = isProduction ? 0xff0000 : 0x00ff00;
        const displayTitle = isProduction ? `🚨 [PROD] ${title}` : `🛠️ [DEV] ${title}`;

        const codeMessage = {
            content: message,
            embeds: [
                {
                    color: embedColor,
                    title: displayTitle,
                    description: '```json\n' + JSON.stringify(code, null, 2) + '\n```',
                    timestamp: new Date().toISOString(), 
                    footer: {
                        text: isProduction ? 'Hệ thống Cảnh báo ShopDev' : 'Debug Mode',
                    },
                },
            ],
        };

        this.sendToMessage(codeMessage);
    }

    sendToMessage(message = 'message') {
        const channel = this.client.channels.cache.get(this.channelId)
        if (!channel) {
            console.error(`Couldn't find the channel...`, this.channelId)
            return
        }
        channel.send(message).catch(e => console.error(e))
    }
}

module.exports = new LoggerService()