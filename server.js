import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import sessionMiddleware from './middlewares/session.middleware.js';
import authRoute from './routes/auth.route.js';
import dashboardRoute from './routes/dashboard.route.js';
import webhookRoute from './routes/webhook.route.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5555;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionMiddleware);

// Routes
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/auth', authRoute);
app.use('/dashboard', dashboardRoute);
app.use('/webhook', webhookRoute);

// Start server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
