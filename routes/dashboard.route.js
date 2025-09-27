import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /dashboard - Show user dashboard (requires authentication)
router.get('/', requireAuth, DashboardController.show);

// POST /dashboard/notify-from-messenger - Notify user from Messenger (requires authentication)
router.post('/notify-from-messenger', requireAuth, DashboardController.notifyFromMessenger);

export default router;
