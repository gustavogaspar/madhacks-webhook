const OracleBot = require('@oracle/bots-node-sdk');
const { WebhookClient, WebhookEvent } = OracleBot.Middleware;
var messageFromBot

module.exports = (app) => {
    const logger = console;

    OracleBot.init(app, {
        logger,
    });

    const webhook = new WebhookClient({
        channel: {
            url: 'https://botv2iad1I0314HC40A97bots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-100b89d671b54afca3069fe360e4bad4/listeners/webhook/channels/2e99cc61-b856-48f3-a2d6-9b265fb0d868',
            secret: 'pwhFbDblYznsyhfboBFKZZTSuS2aF5Al',
        }
    });

    webhook
        .on(WebhookEvent.ERROR, err => logger.error('Error:', err.message))
        .on(WebhookEvent.MESSAGE_SENT, message => logger.info('Message to bot:', message))
        .on(WebhookEvent.MESSAGE_RECEIVED, message => {
            logger.info('Message from bot:', message);
            messageFromBot = message
        });

    app.post('/bot/message', webhook.receiver());


    app.post('/test/message', (req, res) => {
        const { user, text } = req.body;
        // construct message to bot from the client message format
        const MessageModel = webhook.MessageModel();
        const message = {
            userId: user,
            messagePayload: MessageModel.textConversationMessage(text)
        };
        // send to bot webhook channel
        webhook.send(message)
            .then(() => {
                webhook.on(WebhookEvent.MESSAGE_RECEIVED, message => {
                    logger.info('Message from bot:', message);
                    message
                });
                setTimeout(() => {
                    console.log('messageFromBot', messageFromBot)
                    res.send(messageFromBot)
                }, 1500);
            }, e => res.status(400).end(e.message));
    });
}
