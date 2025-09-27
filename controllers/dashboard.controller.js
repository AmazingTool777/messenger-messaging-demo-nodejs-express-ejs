import { FACEBOOK_PAGE_DEEP_LINK_URL } from '../config/facebook.config.js';
import UserService from '../services/user.service.js';
import FacebookService from '../services/facebook.service.js';

export default class DashboardController {
  static async show(req, res) {
    try {
      const userId = req.session.userId;
      const authMethod = req.session.authMethod;

      const feedback = req.session.feedback;
      delete req.session.feedback;

      // Get user data from Redis
      const authUser = await UserService.getUserByIdentifier(userId, authMethod);

      if (!authUser) {
        return res.redirect('/auth/login');
      }

      return res.render('dashboard', {
        authUser,
        facebookPageMessagingUrl: FACEBOOK_PAGE_DEEP_LINK_URL,
        feedback,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      return res.redirect('/auth/login');
    }
  }

  static async notifyFromMessenger(req, res) {
    try {
      const { userId, authMethod } = req.session;
      const authUser = await UserService.getUserByIdentifier(userId, authMethod);
      if (!authUser) {
        throw new Error('User not found');
      }
      await FacebookService.sendOrderUpdate(authUser.psid);
      req.session.feedback = {
        type: 'success',
        message: 'La notification a été envoyée avec succès',
      };
      return res.redirect('/dashboard');
    } catch (error) {
      console.error('Error notifying from Messenger:', error);
      req.session.feedback = {
        type: 'error',
        message: "Une erreur est survenue lors de l'envoi de la notification",
      };
      return res.redirect('/dashboard');
    }
  }
}
