import { BASE_URL } from './url.config.js';

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
export const FACEBOOK_OAUTH_CALLBACK_URL = `${BASE_URL}/auth/facebook/callback`;
export const FACEBOOK_ACCOUNT_LINKING_URL = `${BASE_URL}/auth/facebook/link`;
export const FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL = `${BASE_URL}/auth/facebook/link`;
export const FACEBOOK_ACCOUNT_LINKING_KEYWORD = 'ACCOUNT_LINKING';
export const FACEBOOK_WEBHOOK_URL = `${BASE_URL}/webhook`;
export const FACEBOOK_WEBHOOK_VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
export const FACEBOOK_SCOPE = ['email', 'public_profile', 'pages_messaging'];
export const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
export const FACEBOOK_PAGE_DEEP_LINK_URL = `https://m.me/${FACEBOOK_PAGE_ID}?ref=link_account`;
export const META_GRAPH_API_VERSION = 'v19.0';
export const META_GRAPH_API_URL = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;
export const FACEBOOK_ACCOUNT_LINKING_TOKEN_SECRET = process.env.FACEBOOK_ACCOUNT_LINKING_TOKEN_SECRET;
export const FACEBOOK_ACCOUNT_LINKING_TOKEN_EXPIRATION = 60 * 2;
