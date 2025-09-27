# Validation avec Express-Validator

## Architecture

- **`dto/auth.dto.js`** : Contient uniquement les règles de validation
- **`middlewares/auth.middleware.js`** : Contient TOUS les middlewares d'authentification (validation + gestion d'erreurs + auth)
- **Centralisation** de tous les middlewares d'authentification en un seul endroit

## Structure des DTOs

Le fichier `dto/auth.dto.js` contient toutes les règles de validation pour l'authentification.

### Règles de validation pour l'inscription

#### Nom complet (`fullName`)

- **Obligatoire** : Ne peut pas être vide
- **Longueur** : Entre 2 et 100 caractères
- **Format** : Uniquement des lettres, espaces, apostrophes et tirets
- **Exemple valide** : "Jean Dupont", "Marie-Claire O'Connor"

#### Email (`email`)

- **Obligatoire** : Ne peut pas être vide
- **Format** : Doit être un email valide
- **Normalisation** : Conversion automatique en minuscules
- **Longueur** : Maximum 255 caractères

#### Mot de passe (`password`)

- **Obligatoire** : Ne peut pas être vide
- **Longueur** : Entre 8 et 128 caractères
- **Complexité** : Doit contenir au moins :
  - Une lettre minuscule (a-z)
  - Une lettre majuscule (A-Z)
  - Un chiffre (0-9)
  - Un caractère spécial (@$!%\*?&)

#### Confirmation du mot de passe (`confirmPassword`)

- **Obligatoire** : Ne peut pas être vide
- **Correspondance** : Doit être identique au champ `password`

## Utilisation dans les routes

```javascript
import { validateEmailSignup, handleSignupValidationErrors } from '../middlewares/auth.middleware.js';

// Route avec validation
router.post(
  '/email-signup',
  validateEmailSignup, // Règles de validation
  handleSignupValidationErrors, // Gestion des erreurs
  AuthController.emailSignup, // Contrôleur
);
```

## Middlewares disponibles

### Validation

- **`validateEmailSignup`** : Règles de validation pour l'inscription
- **`validateEmailLogin`** : Règles de validation pour la connexion

### Gestion d'erreurs

- **`handleSignupValidationErrors`** : Gère les erreurs de validation pour l'inscription
- **`handleLoginValidationErrors`** : Gère les erreurs de validation pour la connexion

### Authentification

- **`redirectIfAuthenticated`** : Redirige les utilisateurs déjà connectés
- **`requireAuth`** : Vérifie que l'utilisateur est authentifié

### Avantages de la centralisation

- **Un seul import** pour tous les middlewares d'authentification
- **Cohérence** dans la gestion des erreurs
- **Maintenance simplifiée** : tout est au même endroit

## Messages d'erreur

Tous les messages sont en français et spécifiques :

- "Le nom complet est obligatoire"
- "Format d'email invalide"
- "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial"
- "Les mots de passe ne correspondent pas"
