import axios from 'axios';
import {
  FACEBOOK_PAGE_ACCESS_TOKEN,
  META_GRAPH_API_URL,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_OAUTH_CALLBACK_URL,
  FACEBOOK_SCOPE,
  FACEBOOK_PAGE_ID,
} from '../config/facebook.config.js';
import AccountLinkingService from './account-linking.service.js';
import { BASE_URL } from '../config/url.config.js';

export default class FacebookService {
  static async sendAccountLinkingPrompt(psid) {
    const { token } = await AccountLinkingService.createMagicLink(psid);
    const signature = await AccountLinkingService.signMagicLink(token, psid);
    const accountLinkingURL = AccountLinkingService.buildMagicLinkURL(token, psid, signature);

    // Then send the message with the Log In button (this is the ONLY way to do account linking)
    const message = {
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: "Pour lier votre compte Messenger avec votre compte sur l'application web afin d'être automatiquement notifié par message venant de l'application, veuillez cliquer sur le bouton ci-dessous.\n\nN.B: Il est préférable que vous soyez connecté sur l'application web pour cliquer sur le bouton.",
            buttons: [
              {
                type: 'web_url',
                url: accountLinkingURL, // Replace with your actual URL
                title: 'Lier mon compte',
                webview_height_ratio: 'full', // Options: compact, tall, full
                messenger_extensions: true, // Set to true if using Messenger Extensions
                // Optional: Add webview_share_button if you want to allow sharing
                webview_share_button: 'hide', // Options: show, hide
              },
            ],
          },
        },
      },
    };

    await axios.post(`${META_GRAPH_API_URL}/me/messages`, message, {
      headers: {
        Authorization: `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate Facebook OAuth authorization URL using Graph API
   * @returns {string} Facebook OAuth authorization URL
   */
  static getFacebookAuthUrl() {
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: FACEBOOK_OAUTH_CALLBACK_URL,
      scope: FACEBOOK_SCOPE.join(','),
      response_type: 'code',
      state: 'facebook_login', // Optional: add state for security
    });

    // Use Graph API URL instead of standard OAuth URL
    return `${META_GRAPH_API_URL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token using Graph API
   * @param {string} code - Authorization code from Facebook
   * @returns {Promise<Object>} Access token data
   */
  static async exchangeCodeForToken(code) {
    try {
      const response = await axios.get(`${META_GRAPH_API_URL}/oauth/access_token`, {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: FACEBOOK_OAUTH_CALLBACK_URL,
          code: code,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error?.response?.data?.error ?? error.message);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Get user profile from Facebook Graph API
   * @param {string} accessToken - Facebook access token
   * @returns {Promise<Object>} User profile data
   */
  static async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${META_GRAPH_API_URL}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error?.response?.data?.error ?? error.message);
      throw new Error('Failed to get user profile from Facebook');
    }
  }

  /**
   * Send order update message with PDF attachment to a user via Messenger
   * @param {string} psid - Page-Scoped ID of the recipient
   * @returns {Promise<Object>} Response from Facebook API
   */
  static async sendOrderUpdate(psid) {
    try {
      // Generate a random past date within the last 30 days
      const now = new Date();
      const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(pastDate);

      // Get the base URL for static files
      const pdfUrl = `${BASE_URL}/static/reservation.pdf`;

      // First, send the text message with POST_PURCHASE_UPDATE tag
      const textMessageData = {
        recipient: { id: psid },
        message: {
          text: `Votre commande du ${formattedDate} a été effectuée avec succès`,
        },
        messaging_type: 'MESSAGE_TAG',
        tag: 'POST_PURCHASE_UPDATE',
      };

      const textResponse = await axios.post(
        `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/messages`,
        textMessageData,
        {
          params: {
            access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Then, send the PDF attachment message using URL
      const attachmentMessageData = {
        recipient: { id: psid },
        message: {
          attachment: {
            type: 'file',
            payload: {
              url: pdfUrl,
            },
          },
        },
        messaging_type: 'MESSAGE_TAG',
        tag: 'POST_PURCHASE_UPDATE',
      };

      const response = await axios.post(
        `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/messages`,
        attachmentMessageData,
        {
          params: {
            access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`Message de mise à jour de commande envoyé avec succès à ${psid}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de mise à jour de commande:", error?.response?.data?.error);
      throw new Error(`Échec de l'envoi du message de mise à jour de commande: ${error.message}`);
    }
  }
}
