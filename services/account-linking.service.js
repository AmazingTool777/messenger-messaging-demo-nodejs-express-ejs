import crypto from 'crypto';
import {
  FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL,
  FACEBOOK_ACCOUNT_LINKING_TOKEN_EXPIRATION,
  FACEBOOK_ACCOUNT_LINKING_TOKEN_SECRET,
} from '../config/facebook.config.js';
import { storageRedisClient } from '../database/redis.client.js';

export default class AccountLinkingService {
  static generateMagicLinkToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static buildMagicLinkStorageKey(token) {
    return `magic_link_token:${token}`;
  }

  static getMagicLinkURL(token) {
    return `${FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL}?token=${token}`;
  }

  static async getMagicLink(token) {
    const key = AccountLinkingService.buildMagicLinkStorageKey(token);
    const psid = await storageRedisClient.get(key);
    if (!psid) {
      throw new Error('Magic link not found');
    }
    return { token, psid };
  }

  static async createMagicLink(psid) {
    const token = AccountLinkingService.generateMagicLinkToken();
    const key = AccountLinkingService.buildMagicLinkStorageKey(token);
    await storageRedisClient.set(key, psid, { EX: FACEBOOK_ACCOUNT_LINKING_TOKEN_EXPIRATION });
    return { token, psid };
  }

  static async signMagicLink(token, psid) {
    // Convertir le token hex en bytes
    const tokenBytes = Buffer.from(token, 'hex');

    // Convertir le PSID en bytes UTF-8
    const psidBytes = Buffer.from(psid, 'utf8');

    // Concaténer les bytes du token et du PSID
    const concatenatedBuffer = Buffer.concat([tokenBytes, psidBytes]);

    // Générer la signature HMAC avec le secret
    const signature = crypto
      .createHmac('sha256', FACEBOOK_ACCOUNT_LINKING_TOKEN_SECRET)
      .update(concatenatedBuffer)
      .digest('hex');

    return signature;
  }

  static async verifyMagicLinkSignature(token, psid, signature) {
    const storedSignature = await AccountLinkingService.signMagicLink(token, psid);
    return storedSignature === signature;
  }

  static async verifyMagicLink(token, psid, signature) {
    const magicLink = await AccountLinkingService.getMagicLink(token);
    if (magicLink.psid !== psid) {
      throw new Error('Invalid PSID');
    }

    const isVerified = await AccountLinkingService.verifyMagicLinkSignature(token, psid, signature);
    if (!isVerified) {
      throw new Error('Invalid account linking magic link signature');
    }

    return true;
  }

  static buildMagicLinkURL(token, psid, signature) {
    return `${FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL}?token=${token}&psid=${psid}&signature=${signature}`;
  }
}
