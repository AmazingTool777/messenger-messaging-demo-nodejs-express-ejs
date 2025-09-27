import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { REDIS_SESSION_DATABASE_URI } from '../config/redis.config.js';

// Create Redis client for sessions
const redisClient = createClient({
  url: REDIS_SESSION_DATABASE_URI,
});

// Add error handling
redisClient.on('error', (err) => {
  console.error('Session Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Session Redis Client Connected');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Create Redis store for sessions
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

const SESSION_SECRET = 'your-secret-key-change-in-production';

// Session middleware configuration
const sessionMiddleware = session({
  store: redisStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

export default sessionMiddleware;
