import FacebookService from '../services/facebook.service.js';
import UserService from '../services/user.service.js';
import bcrypt from 'bcrypt';
import AccountLinkingService from '../services/account-linking.service.js';

export default class AuthController {
  static async loginView(req, res) {
    return res.render('login');
  }

  static async facebookLogin(req, res) {
    try {
      // Redirect to Facebook OAuth
      const authUrl = FacebookService.getFacebookAuthUrl();
      return res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating Facebook OAuth:', error);
      return res.status(500).send('Error initiating Facebook login');
    }
  }

  static async emailLogin(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      // Get user by email
      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return res.render('login', {
          error: 'Email ou mot de passe incorrect',
          email: email || '',
          rememberMe: rememberMe || '',
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.render('login', {
          error: 'Email ou mot de passe incorrect',
          email: email || '',
          rememberMe: rememberMe || '',
        });
      }

      // Store user email in session for authentication
      req.session.userId = email;
      req.session.authMethod = 'email';

      // Configure session persistence based on rememberMe checkbox
      if (rememberMe === 'on') {
        // Session persists for 30 days
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      } else {
        // Session expires when browser closes
        req.session.cookie.expires = false;
      }

      // Check for loginFrom redirect
      const loginFrom = req.session.loginFrom;
      if (loginFrom) {
        delete req.session.loginFrom;
        return res.redirect(loginFrom);
      }

      req.session.feedback = {
        type: 'success',
        message: 'Vous êtes maintenant connecté',
      };

      // Redirect to dashboard on success
      return res.redirect('/dashboard');
    } catch (error) {
      console.error('Error during email login:', error);

      // Generic error for unexpected issues
      return res.render('login', {
        error: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        email: req.body.email || '',
        rememberMe: req.body.rememberMe || '',
      });
    }
  }

  static async facebookCallback(req, res) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).send('Authorization code not provided');
      }

      // Exchange code for access token
      const tokenData = await FacebookService.exchangeCodeForToken(code);
      const { access_token } = tokenData;

      // Get user profile
      const userProfile = await FacebookService.getUserProfile(access_token);

      // Check if user already exists
      const existingUser = await UserService.getUserByFacebookId(userProfile.id);

      if (existingUser) {
        // User exists, log them in
        req.session.userId = userProfile.id;
        req.session.authMethod = 'facebook';

        // Check for loginFrom redirect
        const loginFrom = req.session.loginFrom;
        if (loginFrom) {
          delete req.session.loginFrom;
          return res.redirect(loginFrom);
        }

        req.session.feedback = {
          type: 'success',
          message: 'Vous êtes maintenant connecté',
        };

        return res.redirect('/dashboard');
      } else {
        // User doesn't exist, create new Facebook user
        await UserService.createFacebookUser({
          facebookId: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.name,
          accessToken: access_token,
        });

        // Store user ID in session for authentication
        req.session.userId = userProfile.id;
        req.session.authMethod = 'facebook';

        // Check for loginFrom redirect
        const loginFrom = req.session.loginFrom;
        if (loginFrom) {
          delete req.session.loginFrom;
          return res.redirect(loginFrom);
        }

        req.session.feedback = {
          type: 'success',
          message: 'Inscription réussie ! Vous êtes maintenant connecté',
        };

        // Redirect to dashboard
        return res.redirect('/dashboard');
      }
    } catch (error) {
      console.error('Error in Facebook OAuth callback:', error);
      return res.status(500).send('Error completing Facebook login');
    }
  }

  static async signupView(req, res) {
    return res.render('signup');
  }

  static async emailSignup(req, res) {
    try {
      const { fullName, email, password } = req.body;

      // Create user using UserService
      await UserService.createUser({
        fullName,
        email,
        password,
      });

      // Store user email in session for authentication
      req.session.userId = email;
      req.session.authMethod = 'email';

      // Set success feedback
      req.session.feedback = {
        type: 'success',
        message: 'Inscription réussie ! Vous êtes maintenant connecté',
      };

      // Redirect to dashboard on success
      return res.redirect('/dashboard');
    } catch (error) {
      console.error('Error during email signup:', error);

      // Handle specific error cases
      if (error.message === 'User with this email already exists') {
        return res.render('signup', {
          error: 'Un compte avec cette adresse email existe déjà',
          fullName: req.body.fullName || '',
          email: req.body.email || '',
        });
      }

      // Generic error for unexpected issues
      return res.render('signup', {
        error: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        fullName: req.body.fullName || '',
        email: req.body.email || '',
      });
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        return res.redirect('/auth/login');
      });
    } catch (error) {
      console.error('Error during logout:', error);
      return res.redirect('/auth/login');
    }
  }

  static async facebookLink(req, res) {
    try {
      const { token, psid, signature } = req.query;

      await AccountLinkingService.verifyMagicLink(token, psid, signature);

      await UserService.updateUserPSID(req.session.userId, req.session.authMethod, psid);

      req.session.feedback = {
        type: 'success',
        message: 'Votre compte Messenger a été lié avec succès',
      };

      return res.redirect('/dashboard');
    } catch (error) {
      console.error('Error during Facebook account linking:', error);
      req.session.feedback = {
        type: 'error',
        message: 'Une erreur est survenue lors de la liaison de votre compte Messenger',
      };
      return res.redirect('/dashboard');
    }
  }
}
