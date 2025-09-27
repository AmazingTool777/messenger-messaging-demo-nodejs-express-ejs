import axios from 'axios';
import { FACEBOOK_PAGE_ACCESS_TOKEN, META_GRAPH_API_URL, FACEBOOK_PAGE_ID } from '../config/facebook.config.js';

/**
 * Script pour configurer le profil Messenger de la page Facebook
 * Configure le bouton "Get Started" et le menu persistant avec un bouton "Lier mon compte"
 */

const PAGE_ID = FACEBOOK_PAGE_ID;

if (!PAGE_ID) {
  console.error('❌ FACEBOOK_PAGE_ID environment variable is required');
  process.exit(1);
}

const messengerProfileData = {
  get_started: {
    payload: 'GET_STARTED',
  },
  persistent_menu: [
    {
      locale: 'default',
      composer_input_disabled: false,
      call_to_actions: [
        {
          type: 'postback',
          title: 'Lier mon compte',
          payload: 'link_account',
        },
      ],
    },
  ],
};

async function setupPersistentMenu() {
  try {
    console.log('🚀 Configuration du profil Messenger...');

    const response = await axios.post(`${META_GRAPH_API_URL}/${PAGE_ID}/messenger_profile`, messengerProfileData, {
      headers: {
        Authorization: `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log('✅ Configuration Messenger réussie !');
      console.log('📋 Éléments configurés :');
      console.log('   - Bouton "Get Started" avec payload: "GET_STARTED"');
      console.log('   - Menu persistant avec bouton: "Obtenir un lien pour lier mon compte"');
      console.log('   - Payload du bouton: "link_account"');
    } else {
      console.error('❌ Erreur lors de la configuration');
      console.error('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la configuration du menu persistant:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.log(error);
      console.error('Error:', error.message);
    }
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPersistentMenu();
}

export default setupPersistentMenu;
