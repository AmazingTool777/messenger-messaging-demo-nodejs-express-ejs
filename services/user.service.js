import { storageRedisClient } from '../database/redis.client.js';
import bcrypt from 'bcrypt';

export default class UserService {
  /**
   * Update user's PSID in Redis storage
   * @param {string} userId - The user's Facebook ID (ASID)
   * @param {string} authMethod - The authentication method ('email' or 'facebook')
   * @param {string} psid - The Page-Scoped ID from Messenger
   * @returns {Promise<Object>} - Updated user data
   */
  static async updateUserPSID(userId, authMethod, psid) {
    try {
      const redisKey = `user:${authMethod}:${userId}`;
      const userDataString = await storageRedisClient.get(redisKey);

      if (!userDataString) {
        throw new Error('User data not found in Redis');
      }

      // Parse user data and add PSID
      const userData = JSON.parse(userDataString);
      userData.psid = psid;
      userData.psidLinkedAt = new Date().toISOString();

      // Update user data in Redis with PSID
      await storageRedisClient.set(redisKey, JSON.stringify(userData));

      console.log(`Successfully linked PSID ${psid} to user ${userId} with auth method ${authMethod}`);
      return userData;
    } catch (error) {
      console.error('Error updating user PSID:', error);
      throw new Error(`Failed to update user PSID: ${error.message}`);
    }
  }

  /**
   * Get user data from Redis storage
   * @param {string} userId - The user's Facebook ID (ASID)
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async getUserData(userId) {
    try {
      const redisKey = `user:${userId}`;
      const userDataString = await storageRedisClient.get(redisKey);

      if (!userDataString) {
        return null;
      }

      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error getting user data:', error);
      throw new Error(`Failed to get user data: ${error.message}`);
    }
  }

  /**
   * Check if user has linked their Messenger account
   * @param {string} userId - The user's Facebook ID (ASID)
   * @returns {Promise<boolean>} - True if user has PSID linked
   */
  static async isUserLinked(userId) {
    try {
      const userData = await this.getUserData(userId);
      return userData && userData.psid;
    } catch (error) {
      console.error('Error checking user link status:', error);
      return false;
    }
  }

  /**
   * Get user data by email from Redis storage
   * @param {string} email - The user's email address
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async getUserByEmail(email) {
    try {
      const redisKey = `user:email:${email}`;
      const userDataString = await storageRedisClient.get(redisKey);

      if (!userDataString) {
        return null;
      }

      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  /**
   * Get user data by Facebook ASID from Redis storage
   * @param {string} facebookId - The user's Facebook ASID
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async getUserByFacebookId(facebookId) {
    try {
      const redisKey = `user:facebook:${facebookId}`;
      const userDataString = await storageRedisClient.get(redisKey);

      if (!userDataString) {
        return null;
      }

      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error getting user by Facebook ID:', error);
      throw new Error(`Failed to get user by Facebook ID: ${error.message}`);
    }
  }

  /**
   * Create a new user and store in Redis
   * @param {Object} userData - User data object
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's plain text password
   * @returns {Promise<Object>} - Created user data (without password)
   */
  static async createUser({ fullName, email, password }) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Prepare user data for storage
      const userData = {
        fullName,
        email,
        password: hashedPassword, // Store hashed password
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store user data in Redis
      const redisKey = `user:email:${email}`;
      await storageRedisClient.set(redisKey, JSON.stringify(userData));

      console.log(`Successfully created user with email: ${email}`);

      // Return user data without password
      const { password: _, ...userDataWithoutPassword } = userData;
      return userDataWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to preserve the original error message
    }
  }

  /**
   * Create a new Facebook user and store in Redis
   * @param {Object} userData - Facebook user data object
   * @param {string} userData.facebookId - User's Facebook ASID
   * @param {string} userData.email - User's email address
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.accessToken - Facebook access token
   * @returns {Promise<Object>} - Created user data (without sensitive data)
   */
  static async createFacebookUser({ facebookId, email, fullName, accessToken }) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByFacebookId(facebookId);
      if (existingUser) {
        throw new Error('User with this Facebook ID already exists');
      }

      // Prepare user data for storage
      const userData = {
        facebookId,
        email,
        fullName,
        accessToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store user data in Redis
      const redisKey = `user:facebook:${facebookId}`;
      await storageRedisClient.set(redisKey, JSON.stringify(userData));

      console.log(`Successfully created Facebook user with ID: ${facebookId}`);

      // Return user data without sensitive data
      const { accessToken: _, ...userDataWithoutToken } = userData;
      return userDataWithoutToken;
    } catch (error) {
      console.error('Error creating Facebook user:', error);
      throw error; // Re-throw to preserve the original error message
    }
  }

  /**
   * Get user data by identifier and auth method
   * @param {string} identifier - User identifier (email or Facebook ID)
   * @param {string} authMethod - Authentication method ('email' or 'facebook')
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async getUserByIdentifier(identifier, authMethod) {
    try {
      if (authMethod === 'email') {
        return await this.getUserByEmail(identifier);
      } else if (authMethod === 'facebook') {
        return await this.getUserByFacebookId(identifier);
      } else {
        throw new Error('Invalid authentication method');
      }
    } catch (error) {
      console.error('Error getting user by identifier:', error);
      throw new Error(`Failed to get user by identifier: ${error.message}`);
    }
  }
}
