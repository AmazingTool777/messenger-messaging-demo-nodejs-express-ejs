import { body } from 'express-validator';

/**
 * Validation rules for email signup
 */
export const emailSignupValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Le nom complet est obligatoire')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom complet doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'adresse email est obligatoire")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("L'email ne peut pas dépasser 255 caractères"),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
    ),

  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est obligatoire')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
];

/**
 * Validation rules for email login
 */
export const emailLoginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'adresse email est obligatoire")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Le mot de passe est obligatoire'),
];
