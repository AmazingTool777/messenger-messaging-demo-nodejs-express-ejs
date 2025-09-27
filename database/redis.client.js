import { createClient } from 'redis';
import { REDIS_STORAGE_DATABASE_URI } from '../config/redis.config.js';

// Storage Redis client (database 1)
export const storageRedisClient = createClient({
  url: REDIS_STORAGE_DATABASE_URI,
});

// Add error handling
storageRedisClient.on('error', (err) => {
  console.error('Storage Redis Client Error:', err);
});

storageRedisClient.on('connect', () => {
  console.log('Storage Redis Client Connected');
});

// Connect to Redis
storageRedisClient.connect().catch(console.error);

// Default Redis client (database 0)
export const redisClient = storageRedisClient;
