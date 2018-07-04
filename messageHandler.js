var events = require('events');

class messageHandler {
  constructor(app, PAGE_ACCESS_TOKEN) {
    this.app = app;
    this.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
    events.EventEmitter.call(this);
  }

  pullHook(){
      this.app.post('/webhook', (req, res) => {
      let body = req.body;
      if (body.object === 'page') {
          body.entry.forEach((entry) => {
              let webhook_event = entry.messaging[0];
              console.log(webhook_event);

              let sender_psid = webhook_event.sender.id;
              console.log('Sender PSID: ' + sender_psid);

              if (webhook_event.message) {
                //emit message event
                this.emitMessage({
                  sender: sender_psid, 
                  message : webhook_event.message
                });
              } 
              else if (webhook_event.postback) handlePostback(sender_psid, webhook_event.postback);
          });

      res.status(200).send('EVENT_RECEIVED');
      } 
      else res.sendStatus(404);

    });
  }
  castHook(VERIFY_TOKEN){
    this.app.get('/webhook', (req, res) => {
      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];
      if (mode && token) {
          if (mode === 'subscribe' && token === VERIFY_TOKEN) {
              console.log('WEBHOOK_VERIFIED');
              res.status(200).send(challenge);
          } 
          else res.sendStatus(403);
      }    
    });
  }
  send(sender_psid, response){
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": this.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) console.log('message sent!')
        else console.error("unable to send message:" + err);
    });
  }
  emitMessage(data){ this.emit('msg', data); }
}
//messageHandler.prototype.__proto__ = events.EventEmitter.prototype;
messageHandler.prototype = new EventEmitter();
module.exports = messageHandler;