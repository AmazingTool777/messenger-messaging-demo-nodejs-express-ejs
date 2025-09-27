import { validationResult } from 'express-validator';
import { emailSignupValidation, emailLoginValidation } from '../dto/auth.dto.js';

/**
 * Middleware to handle validation errors for signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const handleSignupValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Get the first error message
    const firstError = errors.array()[0];

    return res.render('signup', {
      error: firstError.msg,
      fullName: req.body.fullName || '',
      email: req.body.email || '',
    });
  }

  next();
};

/**
 * Middleware to handle validation errors for login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const handleLoginValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    return res.render('login', {
      error: firstError.msg,
      email: req.body.email || '',
    });
  }

  next();
};

/**
 * Middleware to redirect authenticated users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

/**
 * Middleware to require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.session.loginFrom = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * Middleware to validate email signup data
 * @returns {Array} Array of validation middlewares
 */
export const validateEmailSignup = emailSignupValidation;

/**
 * Middleware to validate email login data
 * @returns {Array} Array of validation middlewares
 */
export const validateEmailLogin = emailLoginValidation;
