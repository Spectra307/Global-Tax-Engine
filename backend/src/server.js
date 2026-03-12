/**
 * server.js - Main Entry Point for the Global Tax Engine Backend API
 *
 * What this file does:
 *   Sets up the Express web server, connects all route handlers, and starts listening for requests.
 *
 * How it interacts with the system:
 *   - Mounts /api/tax    → routes/tax.js
 *   - Mounts /api/invoice → routes/invoice.js
 *   - Mounts /api/history → routes/history.js
 *
 * Start with: node src/server.js  (or npm run dev)
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route handlers
const taxRoutes = require('./routes/tax');
const invoiceRoutes = require('./routes/invoice');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from any origin (needed for SvelteKit frontend on another port)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Global Tax Engine API is running 🚀' });
});

// Tax calculation routes
app.use('/api/tax', taxRoutes);

// Invoice generation routes
app.use('/api/invoice', invoiceRoutes);

// Calculation history routes
app.use('/api/history', historyRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Global Tax Engine API running at http://localhost:${PORT}`);
});
