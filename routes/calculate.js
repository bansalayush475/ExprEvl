// routes/calculate.js
// ─────────────────────────────────────────────────────────────────────────────
// REST API route handlers for Stack Calculator & DSA Suite
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express = require('express');
const router  = express.Router();
const {
  calculate,
  shuntingYard,
  infixToPrefix,
  evalPostfix,
  evalPrefix,
  buildExpressionTree,
  tokenise
} = require('../src/calculator');

// ── In-memory history (last 50 items across modules) ──────────────────────────
const history = [];
const MAX_HISTORY = 50;

function addHistory(item) {
  history.unshift({
    id: Date.now() + Math.random().toString(36).substr(2, 4),
    module: item.module || 'Calculator',
    expression: item.expression,
    result: item.result,
    timestamp: new Date().toISOString()
  });
  if (history.length > MAX_HISTORY) history.pop();
}

// ── POST /api/calculate ───────────────────────────────────────────────────────
router.post('/calculate', (req, res) => {
  const { expression, module } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing or invalid "expression" field.' });
  }
  const cleanExpr = expression.trim();
  if (cleanExpr.length === 0) {
    return res.status(400).json({ success: false, error: 'Expression cannot be empty.' });
  }
  if (cleanExpr.length > 500) {
    return res.status(400).json({ success: false, error: 'Expression too long (max 500 chars).' });
  }

  try {
    const data = calculate(cleanExpr);
    addHistory({
      module: module || 'Calculator',
      expression: data.expression,
      result: data.result
    });
    return res.json({ success: true, ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── POST /api/infix-to-postfix ────────────────────────────────────────────────
router.post('/infix-to-postfix', (req, res) => {
  const { expression } = req.body;
  if (!expression || !expression.trim()) {
    return res.status(400).json({ success: false, error: 'Expression cannot be empty.' });
  }
  try {
    const tokens = tokenise(expression.trim());
    const data = shuntingYard(tokens);
    addHistory({
      module: 'Infix → Postfix',
      expression: expression.trim(),
      result: data.postfixString
    });
    return res.json({ success: true, expression: expression.trim(), ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── POST /api/infix-to-prefix ─────────────────────────────────────────────────
router.post('/infix-to-prefix', (req, res) => {
  const { expression } = req.body;
  if (!expression || !expression.trim()) {
    return res.status(400).json({ success: false, error: 'Expression cannot be empty.' });
  }
  try {
    const data = infixToPrefix(expression.trim());
    addHistory({
      module: 'Infix → Prefix',
      expression: expression.trim(),
      result: data.prefixString
    });
    return res.json({ success: true, expression: expression.trim(), ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── POST /api/postfix-eval ────────────────────────────────────────────────────
router.post('/postfix-eval', (req, res) => {
  const { expression } = req.body;
  if (!expression || !expression.trim()) {
    return res.status(400).json({ success: false, error: 'Postfix expression cannot be empty.' });
  }
  try {
    const data = evalPostfix(expression.trim());
    addHistory({
      module: 'Postfix Eval',
      expression: expression.trim(),
      result: data.result
    });
    return res.json({ success: true, expression: expression.trim(), ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── POST /api/prefix-eval ─────────────────────────────────────────────────────
router.post('/prefix-eval', (req, res) => {
  const { expression } = req.body;
  if (!expression || !expression.trim()) {
    return res.status(400).json({ success: false, error: 'Prefix expression cannot be empty.' });
  }
  try {
    const data = evalPrefix(expression.trim());
    addHistory({
      module: 'Prefix Eval',
      expression: expression.trim(),
      result: data.result
    });
    return res.json({ success: true, expression: expression.trim(), ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── POST /api/expression-tree ─────────────────────────────────────────────────
router.post('/expression-tree', (req, res) => {
  const { expression } = req.body;
  if (!expression || !expression.trim()) {
    return res.status(400).json({ success: false, error: 'Expression cannot be empty.' });
  }
  try {
    const data = buildExpressionTree(expression.trim());
    addHistory({
      module: 'Expression Tree',
      expression: expression.trim(),
      result: `Depth: ${data.metrics.depth}, Nodes: ${data.metrics.totalNodes}`
    });
    return res.json({ success: true, expression: expression.trim(), ...data });
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }
});

// ── GET /api/history ──────────────────────────────────────────────────────────
router.get('/history', (_req, res) => {
  res.json({ success: true, count: history.length, history });
});

// ── POST /api/history (custom client history event e.g. from Stack Visualizer) ─
router.post('/history', (req, res) => {
  const { module, expression, result } = req.body;
  if (!expression) {
    return res.status(400).json({ success: false, error: 'Missing expression' });
  }
  addHistory({
    module: module || 'Manual',
    expression: String(expression),
    result: String(result || '')
  });
  res.json({ success: true, history });
});

// ── DELETE /api/history ───────────────────────────────────────────────────────
router.delete('/history', (_req, res) => {
  history.length = 0;
  res.json({ success: true, message: 'History cleared.' });
});

module.exports = router;
