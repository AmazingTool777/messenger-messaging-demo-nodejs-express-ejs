import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import {
  redirectIfAuthenticated,
  handleSignupValidationErrors,
  handleLoginValidationErrors,
  validateEmailSignup,
  validateEmailLogin,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /auth/login - Show login page (redirect if already authenticated)
router.get('/login', redirectIfAuthenticated, AuthController.loginView);

// POST /auth/login/facebook - Process Facebook login
router.post('/login/facebook', AuthController.facebookLogin);

// POST /auth/email-login - Process email login
router.post('/email-login', validateEmailLogin, handleLoginValidationErrors, AuthController.emailLogin);

// GET /auth/signup - Show signup page
router.get('/signup', redirectIfAuthenticated, AuthController.signupView);

// POST /auth/email-signup - Process email signup
router.post('/email-signup', validateEmailSignup, handleSignupValidationErrors, AuthController.emailSignup);

// GET /auth/facebook/callback - Handle Facebook OAuth callback
router.get('/facebook/callback', AuthController.facebookCallback);

// GET /auth/link - Link account
router.get('/facebook/link', AuthController.facebookLink);

// GET /auth/logout - Logout user
router.post('/logout', AuthController.logout);

export default router;
