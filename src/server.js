// src/server.js
// ─────────────────────────────────────────────────────────────────────────────
// Express REST API server for Stack Calculator
//
// Endpoints:
//   POST   /api/calculate   { expression }  →  result + tokens + step traces
//   GET    /api/history                     →  last 20 calculations
//   DELETE /api/history                     →  clear history
//   GET    /health                          →  uptime check
//
// Serves the frontend statically from /public
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const calcRouter = require('../routes/calculate');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', calcRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: `${Math.floor(process.uptime())}s` });
});

// Fallback — always serve index.html (single page)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
function startServer(port) {
  const server = app.listen(port, () => {
    console.log('');
    console.log('  ┌─────────────────────────────────────┐');
    console.log('  │       Stack Calculator Server        │');
    console.log('  ├─────────────────────────────────────┤');
    console.log(`  │  ► http://localhost:${port}             │`);
    console.log('  │  Press Ctrl+C to stop               │');
    console.log('  └─────────────────────────────────────┘');
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
