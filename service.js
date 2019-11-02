const OracleBot = require('@oracle/bots-node-sdk');
const { WebhookClient, WebhookEvent } = OracleBot.Middleware;

module.exports = (app) => {
  const logger = console;

  OracleBot.init(app, {
    logger,
  });


  const webhook = new WebhookClient({
    channel: {
      url: 'https://botv2iad1I0314HC40A97bots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-100b89d671b54afca3069fe360e4bad4/listeners/webhook/channels/2e99cc61-b856-48f3-a2d6-9b265fb0d868' ,
      secret: '71doE4zWl74v87E6mzHfeYo4asGvgFV4' ,
    }
  });

  webhook
    .on(WebhookEvent.ERROR, err => logger.error('Error:', err.message))
    .on(WebhookEvent.MESSAGE_SENT, message => logger.info('Message to bot:', message))
    .on(WebhookEvent.MESSAGE_RECEIVED, message => {
      logger.info('Message from bot:', message);
    });

  app.post('/bot/message', webhook.receiver());


  app.post('/test/message', (req, res) => {
    const { user, text } = req.body;

    const MessageModel = webhook.MessageModel();
    const message = {
      userId: user,
      messagePayload: MessageModel.textConversationMessage(text)
    };

    webhook.send(message)
      .then(async () =>  {
          await webhook.on(WebhookEvent.MESSAGE_RECEIVED, mes => {
              res.send(mes.messagePayload.text)
          })
          }, e => res.status(400).end(e.message));
  });
}
