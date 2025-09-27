import axios from 'axios';
import {
  FACEBOOK_PAGE_ACCESS_TOKEN,
  FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL,
  META_GRAPH_API_URL,
} from '../config/facebook.config.js';
import { BASE_URL } from '../config/url.config.js';

/**
 * Configure the account linking URL for the Facebook Page
 * This must be done before account linking can work
 */
const setAccountLinkingURL = async (whitelistedDomains = []) => {
  try {
    console.log('Setting account linking URL...');

    const requestBody = {
      // account_linking_url: FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL,
      account_linking_url: 'https://google.com',
    };

    // Ajouter les domaines whitelistés si fournis
    if (whitelistedDomains && whitelistedDomains.length > 0) {
      requestBody.whitelisted_domains = [...whitelistedDomains, 'https://google.com'];
      console.log('📋 Whitelisted domains:', whitelistedDomains);
    }

    const response = await axios.post(`${META_GRAPH_API_URL}/me/messenger_profile`, requestBody, {
      headers: {
        Authorization: `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Account linking URL set successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error setting account linking URL:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get current messenger profile settings
 */
const getMessengerProfile = async () => {
  try {
    const response = await axios.get(`${META_GRAPH_API_URL}/me/messenger_profile`, {
      headers: {
        Authorization: `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`,
      },
      params: {
        fields: 'account_linking_url,whitelisted_domains,greeting,ice_breakers,persistent_menu',
      },
    });

    console.log('Current messenger profile:', response.data);
    console.log('Account linking URL:', response.data.data[0].account_linking_url);
    console.log('Whitelisted domains:', response.data.data[0].whitelisted_domains);
    console.log('Greeting:', response.data.data[0].greeting);
    console.log('Ice breakers:', response.data.data[0].ice_breakers);
    console.log('Persistent menu:', response.data.data[0].persistent_menu);
    return response.data;
  } catch (error) {
    console.error('Error getting messenger profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Unlink a specific user's account by PSID
 * This unlinks a user's account from the page
 */
const unlinkUserAccount = async (psid) => {
  try {
    console.log(`Unlinking user account for PSID: ${psid}...`);

    const response = await axios.post(
      `https://graph.facebook.com/v2.6/me/unlink_accounts?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
      {
        psid: psid,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ User account unlinked successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error unlinking user account:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Parse command line arguments and execute the appropriate action
 */
const parseArguments = () => {
  const args = process.argv.slice(2);

  // Default to -l if no arguments provided
  if (args.length === 0) {
    return 'link';
  }

  // Check for flags
  if (args.includes('-l') || args.includes('--link')) {
    return 'link';
  }
  if (args.includes('-p') || args.includes('--profile')) {
    return 'profile';
  }
  if (args.includes('-U') || args.includes('--unlink-user')) {
    return 'unlink-user';
  }

  // If unknown flag, show help
  console.log('❌ Unknown flag. Available options:');
  console.log('  -l, --link         Set account linking URL (default)');
  console.log('  -p, --profile      Get messenger profile');
  console.log('  -U, --unlink-user  Unlink specific user by PSID');
  console.log('  -h, --help         Show this help message');
  process.exit(1);
};

/**
 * Show help message
 */
const showHelp = () => {
  console.log('🔧 Facebook Messenger Account Linking Setup');
  console.log('');
  console.log('Usage: node setup-account-linking.js [options] [psid]');
  console.log('');
  console.log('Options:');
  console.log('  -l, --link         Set account linking URL (default)');
  console.log('  -p, --profile      Get current messenger profile settings');
  console.log('  -U, --unlink-user  Unlink specific user by PSID');
  console.log('  -h, --help         Show this help message');
  console.log('');
  console.log('Parameters:');
  console.log(
    '  --domains=domain1,domain2  Additional domains to whitelist (base URL and YouTube included by default)',
  );
  console.log('');
  console.log('Default whitelisted domains:');
  console.log('  - Base URL from config');
  console.log('  - youtube.com');
  console.log('  - www.youtube.com');
  console.log('');
  console.log('Examples:');
  console.log(
    '  node setup-account-linking.js                                    # Set account linking URL with default domains',
  );
  console.log(
    '  node setup-account-linking.js -l                                 # Set account linking URL with default domains',
  );
  console.log('  node setup-account-linking.js -l --domains=example.com,app.com  # Add custom domains to defaults');
  console.log('  node setup-account-linking.js -p                                 # Get messenger profile');
  console.log('  node setup-account-linking.js -U 1234567890                      # Unlink user by PSID');
};

// Main execution function
const main = async () => {
  try {
    const args = process.argv.slice(2);

    // Show help if requested
    if (args.includes('-h') || args.includes('--help')) {
      showHelp();
      return;
    }

    const action = parseArguments();

    switch (action) {
      case 'link':
        console.log('🔧 Setting up Facebook Messenger Account Linking...');
        console.log(`📝 Account Linking URL: ${FACEBOOK_ACCOUNT_LINKING_CALLBACK_URL}`);

        // Récupérer les domaines whitelistés depuis les arguments de ligne de commande
        const domainsArg = args.find((arg) => arg.startsWith('--domains='));
        const customDomains = domainsArg ? domainsArg.split('=')[1].split(',') : [];

        // Domaines whitelistés par défaut : URL de base et YouTube
        const defaultDomains = [BASE_URL];

        // Combiner les domaines par défaut avec les domaines personnalisés
        const whitelistedDomains = [...defaultDomains, ...customDomains];

        await setAccountLinkingURL(whitelistedDomains);
        console.log('🎉 Account linking URL set successfully!');
        break;

      case 'profile':
        console.log('📋 Getting Messenger Profile...');
        await getMessengerProfile();
        console.log('✅ Profile retrieved successfully!');
        break;

      case 'unlink-user':
        const psid = args.find((arg) => !arg.startsWith('-'));
        if (!psid) {
          console.error('❌ PSID is required for user unlinking');
          console.log('Usage: node setup-account-linking.js -U <PSID>');
          process.exit(1);
        }
        console.log(`🗑️  Unlinking user account for PSID: ${psid}...`);
        await unlinkUserAccount(psid);
        console.log('✅ User account unlinked successfully!');
        break;

      default:
        console.error('❌ Unknown action:', action);
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { setAccountLinkingURL, getMessengerProfile, unlinkUserAccount };
