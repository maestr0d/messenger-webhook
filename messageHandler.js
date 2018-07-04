const EventEmitter = require('events');

class messageHandler extends EventEmitter {
//class messageHandler {
  constructor(app, PAGE_ACCESS_TOKEN) {
    super();
    this.app = app;
    this.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
    //EventEmitter.call(this);
  }

  pullHook(){
    console.log("Hook pulled");
      this.app.post('/webhook', (req, res) => {
      console.log("Webhook received a post");
      let body = req.body;
      if (body.object === 'page') {
          body.entry.forEach((entry) => {
              let webhook_event = entry.messaging[0];
              console.log(webhook_event);

              let sender_psid = webhook_event.sender.id;
              console.log('Sender PSID: ' + sender_psid);

              if (webhook_event.message) {
                //emit message event
                var data = {
                  sender: sender_psid, 
                  message : webhook_event.message
                }
                this.emit('message', data);
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
              this.pullHook();
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
}
//messageHandler.prototype.__proto__ = events.EventEmitter.prototype;
//messageHandler.prototype = new events.EventEmitter();
module.exports = messageHandler;