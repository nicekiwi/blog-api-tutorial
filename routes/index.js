'use strict'

let express = require('express');
let mandrill = require('mandrill-api/mandrill');
let router = express.Router();

router.post('/contact', function(req, res, next) {
  // Setup Mandrill Client with API KEY
  let mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

  // Grab our forms values, these have allready been sanitized
  let senderName = req.body.sender_name;
  let senderEmail = req.body.sender_email;
  let senderMessage = req.body.sender_message;

  // Setup our Email template
  let messageTemplate =
  `Message Reads: ${senderMessage}

  Kind Regards
  ${senderName},
  ${senderEmail}
  `;

  let message = {
    text: messageTemplate,
    subject: "New Message from The Blog",
    from_email: senderEmail,
    from_name: senderName,
    to: [{ email: process.env.DELIVERY_EMAIL }]
  }

  // Send the Email
  mandrillClient.messages.send(
    { "message": message },
    function() {
      // Success Action
      res.json({ sent: true });
    }, 
    function(e) {

      let message = 'A mandrill error occurred: ' + e.name + ' - ' + e.message;

      // Error action, even though we dont show this message to the user, it can still be useful to send back
      res.json({ sent: false, message: message });

      // These errors will show up in the Heroku logs, not ideal. But just basic. :)
      console.error(message);
    }
  );
});