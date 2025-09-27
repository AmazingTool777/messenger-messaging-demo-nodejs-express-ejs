import FacebookService from '../services/facebook.service.js';
import { FACEBOOK_WEBHOOK_VERIFY_TOKEN, FACEBOOK_ACCOUNT_LINKING_KEYWORD } from '../config/facebook.config.js';

export default class WebhookController {
  static async verify(req, res) {
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  static async handle(req, res) {
    try {
      const entry = req.body.entry[0];

      if (entry.messaging) {
        entry.messaging.forEach(async (event) => {
          // console.log('event', event);
          const psid = event.sender.id;

          const isRequestingAccountLinking =
            (event.referral &&
              event.referral.source === 'SHORTLINK' &&
              event.referral.type === 'OPEN_THREAD' &&
              event.referral.ref === 'link_account') ||
            (event.postback && event.postback.payload === 'link_account') ||
            (event.message && event.message.text && event.message.text.trim() === FACEBOOK_ACCOUNT_LINKING_KEYWORD);
          // Handle referral events (existing functionality)
          if (isRequestingAccountLinking) {
            console.log('Sending account linking prompt to user', psid);
            await FacebookService.sendAccountLinkingPrompt(psid);
          }
        });
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error('Error handling webhook:', error?.response?.data?.error ?? error.message);
      return res.sendStatus(500);
    }
  }
}
