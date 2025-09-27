import express from 'express';
import WebhookController from '../controllers/webhook.controller.js';

const router = express.Router();

router.get('/', WebhookController.verify);
router.post('/', WebhookController.handle);

export default router;
