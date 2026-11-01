// src/calculator.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure DSA Logic for Stack Calculator & DSA Suite
// Exports:
//   - Stack
//   - TreeNode
//   - tokenise
//   - shuntingYard (Infix to Postfix)
//   - infixToPrefix
//   - evalPostfix
//   - evalPrefix
//   - buildExpressionTree
//   - calculate
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

// ── Stack Data Structure ──────────────────────────────────────────────────────
class Stack {
  constructor(capacity = Infinity) {
    this.data = [];
    this.capacity = capacity;
  }

  push(val) {
    if (this.size() >= this.capacity) {
      throw new Error('Stack overflow: capacity reached');
    }
    this.data.push(val);
    return val;
  }

  pop() {
    if (this.isEmpty()) throw new Error('Stack underflow: stack is empty');
    return this.data.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.data[this.data.length - 1];
  }

  isEmpty() {
    return this.data.length === 0;
  }

  isFull() {
    return this.data.length >= this.capacity;
  }

  size() {
    return this.data.length;
  }

  clear() {
    this.data = [];
  }

  snapshot() {
    return [...this.data];
  }
}

// ── Tree Node for Expression Tree ─────────────────────────────────────────────
class TreeNode {
  constructor(val, type = 'operand') {
    this.val = val;
    this.type = type; // 'operand' | 'operator' | 'function'
    this.left = null;
    this.right = null;
    this.id = 'node_' + Math.random().toString(36).substr(2, 9);
  }
}

// ── Operators and Functions Metadata ──────────────────────────────────────────
const OPERATORS = {
  '+':  { prec: 1, assoc: 'L', fn: (a, b) => a + b },
  '-':  { prec: 1, assoc: 'L', fn: (a, b) => a - b },
  '*':  { prec: 2, assoc: 'L', fn: (a, b) => a * b },
  '/':  { prec: 2, assoc: 'L', fn: (a, b) => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }},
  '%':  { prec: 2, assoc: 'L', fn: (a, b) => a % b },
  '^':  { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
  '**': { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
};

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial requires non-negative integer');
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

const FUNCTIONS = {
  'sqrt': { args: 1, fn: a => { if (a < 0) throw new Error('Negative sqrt'); return Math.sqrt(a); } },
  'cbrt': { args: 1, fn: a => Math.cbrt(a) },
  'sin':  { args: 1, fn: a => Math.sin(a) },
  'cos':  { args: 1, fn: a => Math.cos(a) },
  'tan':  { args: 1, fn: a => Math.tan(a) },
  'log':  { args: 1, fn: a => { if (a <= 0) throw new Error('Log domain error'); return Math.log10(a); } },
  'ln':   { args: 1, fn: a => { if (a <= 0) throw new Error('Ln domain error'); return Math.log(a); } },
  'abs':  { args: 1, fn: a => Math.abs(a) },
  'exp':  { args: 1, fn: a => Math.exp(a) },
  'fact': { args: 1, fn: a => factorial(a) },
};

const CONSTANTS = {
  'pi': Math.PI,
  'π':  Math.PI,
  'e':  Math.E,
};

// ── Number Formatter ──────────────────────────────────────────────────────────
function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return 'NaN';
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Number.isInteger(n)) return n;
  return parseFloat(n.toFixed(8));
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────
function tokenise(expr) {
  const tokens = [];
  let i = 0;
  expr = String(expr).trim();

  while (i < expr.length) {
    const ch = expr[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Known multi-char function names: sqrt, cbrt, sin, cos, tan, log, ln, abs, exp, fact
    const matchFunc = expr.slice(i).match(/^(sqrt|cbrt|sin|cos|tan|log|ln|abs|exp|fact)\b/i);
    if (matchFunc) {
      const fnName = matchFunc[1].toLowerCase();
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'num' || prev.val === ')') {
          tokens.push({ type: 'op', val: '*', raw: '*' });
        }
      }
      tokens.push({ type: 'func', val: fnName, raw: fnName });
      i += fnName.length;
      continue;
    }

    // Constants: pi, π, e
    if (ch === 'π') {
      if (tokens.length > 0 && (tokens[tokens.length - 1].type === 'num' || tokens[tokens.length - 1].val === ')')) {
        tokens.push({ type: 'op', val: '*', raw: '*' });
      }
      tokens.push({ type: 'num', val: Math.PI, raw: 'π' });
      i++;
      continue;
    }
    const matchConst = expr.slice(i).match(/^(pi|e)\b/i);
    if (matchConst) {
      const cName = matchConst[1].toLowerCase();
      if (tokens.length > 0 && (tokens[tokens.length - 1].type === 'num' || tokens[tokens.length - 1].val === ')')) {
        tokens.push({ type: 'op', val: '*', raw: '*' });
      }
      tokens.push({ type: 'num', val: CONSTANTS[cName], raw: cName });
      i += cName.length;
      continue;
    }

    // Power operators: ** or ^
    if (expr.slice(i, i + 2) === '**') {
      tokens.push({ type: 'op', val: '^', raw: '^' });
      i += 2;
      continue;
    }
    if (ch === '^') {
      tokens.push({ type: 'op', val: '^', raw: '^' });
      i++;
      continue;
    }

    // Unary +/- : at start or after operator / open parenthesis
    if (
      (ch === '-' || ch === '+') &&
      (tokens.length === 0 ||
       tokens[tokens.length - 1].type === 'op' ||
       tokens[tokens.length - 1].val === '(')
    ) {
      const sign = ch === '-' ? -1 : 1;
      i++;
      if (i < expr.length && /[0-9.]/.test(expr[i])) {
        let n = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) n += expr[i++];
        const val = sign * parseFloat(n);
        tokens.push({ type: 'num', val, raw: String(val) });
      } else {
        tokens.push({ type: 'num', val: 0, raw: '0' });
        tokens.push({ type: 'op', val: ch, raw: ch });
      }
      continue;
    }

    // Numbers (integers or floating decimals)
    if (/[0-9.]/.test(ch)) {
      let n = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) n += expr[i++];
      tokens.push({ type: 'num', val: parseFloat(n), raw: n });
      continue;
    }

    // Single character operators: + - * / %
    if ('+-*/%'.includes(ch)) {
      tokens.push({ type: 'op', val: ch, raw: ch });
      i++;
      continue;
    }

    // Factorial operator '!'
    if (ch === '!') {
      tokens.push({ type: 'func_post', val: 'fact', raw: '!' });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      if (ch === '(' && tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'num' || prev.val === ')') {
          tokens.push({ type: 'op', val: '*', raw: '*' });
        }
      }
      tokens.push({ type: 'paren', val: ch, raw: ch });
      i++;
      continue;
    }

    // Single letter variables/symbols e.g. x, y, A, B for general DSA conversions
    if (/[a-zA-Z]/.test(ch)) {
      tokens.push({ type: 'var', val: ch, raw: ch });
      i++;
      continue;
    }

    throw new Error(`Unknown character: "${ch}"`);
  }

  return tokens;
}

// ── Infix to Postfix (Shunting-Yard) ───────────────────────────────────────────
function shuntingYard(tokens) {
  const output = [];
  const opStack = new Stack();
  const steps = [];

  const snap = () => ({
    opStack: opStack.snapshot().map(t => t.raw || String(t)),
    output: output.map(t => t.raw || String(t)),
  });

  for (const tok of tokens) {
    if (tok.type === 'num' || tok.type === 'var') {
      output.push(tok);
      steps.push({ token: tok.raw, action: `Push operand '${tok.raw}' to output`, ...snap() });

    } else if (tok.type === 'func') {
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push function '${tok.raw}' to stack`, ...snap() });

    } else if (tok.type === 'func_post') {
      output.push(tok);
      steps.push({ token: tok.raw, action: `Append postfix operator '${tok.raw}' to output`, ...snap() });

    } else if (tok.type === 'op') {
      const meta = OPERATORS[tok.val] || { prec: 1, assoc: 'L' };
      while (
        !opStack.isEmpty() &&
        (opStack.peek().type === 'op' || opStack.peek().type === 'func')
      ) {
        const top = opStack.peek();
        if (top.type === 'func') {
          const popped = opStack.pop();
          output.push(popped);
          steps.push({ token: tok.raw, action: `Pop function '${popped.raw}' to output`, ...snap() });
          continue;
        }
        const topMeta = OPERATORS[top.val] || { prec: 1, assoc: 'L' };
        if (
          (meta.assoc === 'L' && topMeta.prec >= meta.prec) ||
          (meta.assoc === 'R' && topMeta.prec > meta.prec)
        ) {
          const popped = opStack.pop();
          output.push(popped);
          steps.push({
            token: tok.raw,
            action: `Pop '${popped.raw}' (precedence ${topMeta.prec} >= ${meta.prec}) to output`,
            ...snap()
          });
        } else {
          break;
        }
      }
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push operator '${tok.raw}' to stack`, ...snap() });

    } else if (tok.val === '(') {
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push '(' to stack`, ...snap() });

    } else if (tok.val === ')') {
      let foundOpen = false;
      while (!opStack.isEmpty()) {
        const top = opStack.pop();
        if (top.val === '(') {
          foundOpen = true;
          break;
        }
        output.push(top);
        steps.push({ token: tok.raw, action: `Pop '${top.raw}' until '(' to output`, ...snap() });
      }
      if (!foundOpen) {
        throw new Error('Mismatched parentheses: missing "("');
      }
      if (!opStack.isEmpty() && opStack.peek().type === 'func') {
        const fn = opStack.pop();
        output.push(fn);
        steps.push({ token: tok.raw, action: `Pop function '${fn.raw}' to output`, ...snap() });
      }
      steps.push({ token: tok.raw, action: `Discard ')' and matching '('`, ...snap() });
    }
  }

  // Pop remaining operators
  while (!opStack.isEmpty()) {
    const top = opStack.pop();
    if (top.val === '(' || top.val === ')') {
      throw new Error('Mismatched parentheses in expression');
    }
    output.push(top);
    steps.push({ token: '(end)', action: `Drain remaining '${top.raw}' to output`, ...snap() });
  }

  const postfixString = output.map(t => t.raw).join(' ');
  return { postfix: output, postfixString, steps };
}

// ── Infix to Prefix Conversion ────────────────────────────────────────────────
// Algorithm:
// 1. Reverse tokens (swap '(' with ')')
// 2. Modified Shunting-Yard (treat left assoc as right assoc for ties)
// 3. Reverse output to produce Prefix expression
function infixToPrefix(expression) {
  const originalTokens = tokenise(expression);
  const steps = [];

  // Step 1: Reverse tokens and invert brackets
  const reversedTokens = [];
  for (let i = originalTokens.length - 1; i >= 0; i--) {
    const tok = { ...originalTokens[i] };
    if (tok.val === '(') { tok.val = ')'; tok.raw = ')'; }
    else if (tok.val === ')') { tok.val = '('; tok.raw = '('; }
    reversedTokens.push(tok);
  }

  steps.push({
    step: '1. Reverse Infix',
    token: '-',
    action: `Reversed expression with inverted brackets: [${reversedTokens.map(t => t.raw).join(' ')}]`,
    opStack: [],
    output: []
  });

  const output = [];
  const opStack = new Stack();

  const snap = () => ({
    opStack: opStack.snapshot().map(t => t.raw || String(t)),
    output: output.map(t => t.raw || String(t)),
  });

  for (const tok of reversedTokens) {
    if (tok.type === 'num' || tok.type === 'var') {
      output.push(tok);
      steps.push({ token: tok.raw, action: `Push operand '${tok.raw}' to output`, ...snap() });

    } else if (tok.val === '(') {
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push '(' to stack`, ...snap() });

    } else if (tok.val === ')') {
      while (!opStack.isEmpty() && opStack.peek().val !== '(') {
        const top = opStack.pop();
        output.push(top);
        steps.push({ token: tok.raw, action: `Pop '${top.raw}' to output`, ...snap() });
      }
      if (!opStack.isEmpty()) opStack.pop(); // discard '('
      steps.push({ token: tok.raw, action: `Discard ')' and '('`, ...snap() });

    } else if (tok.type === 'op') {
      const meta = OPERATORS[tok.val] || { prec: 1, assoc: 'L' };
      while (!opStack.isEmpty() && opStack.peek().type === 'op') {
        const topMeta = OPERATORS[opStack.peek().val] || { prec: 1, assoc: 'L' };
        // For prefix from reversed infix: pop if top has strictly higher precedence,
        // or same precedence if right-associative (opposite of standard infix to postfix)
        const shouldPop = (meta.assoc === 'L' && topMeta.prec > meta.prec) ||
                          (meta.assoc === 'R' && topMeta.prec >= meta.prec);
        if (shouldPop) {
          const top = opStack.pop();
          output.push(top);
          steps.push({ token: tok.raw, action: `Pop '${top.raw}' to output`, ...snap() });
        } else {
          break;
        }
      }
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push operator '${tok.raw}' to stack`, ...snap() });

    } else if (tok.type === 'func') {
      opStack.push(tok);
      steps.push({ token: tok.raw, action: `Push function '${tok.raw}' to stack`, ...snap() });
    }
  }

  while (!opStack.isEmpty()) {
    const top = opStack.pop();
    output.push(top);
    steps.push({ token: '(end)', action: `Drain remaining '${top.raw}' to output`, ...snap() });
  }

  // Reverse output to get final prefix
  const prefixTokens = [...output].reverse();
  const prefixString = prefixTokens.map(t => t.raw).join(' ');

  steps.push({
    step: 'Final Step',
    token: '-',
    action: `Reverse output array to get final Prefix: ${prefixString}`,
    opStack: [],
    output: prefixTokens.map(t => t.raw)
  });

  return { prefix: prefixTokens, prefixString, steps };
}

// ── Postfix Evaluator ─────────────────────────────────────────────────────────
function evalPostfix(postfixInput) {
  let tokens = [];
  if (Array.isArray(postfixInput)) {
    tokens = postfixInput;
  } else if (typeof postfixInput === 'string') {
    // Check if input is space-separated or raw infix
    const trimmed = postfixInput.trim();
    if (trimmed.includes(' ')) {
      // Space separated postfix tokens
      const parts = trimmed.split(/\s+/);
      tokens = parts.map(p => {
        if (!isNaN(p)) return { type: 'num', val: parseFloat(p), raw: p };
        if (FUNCTIONS[p.toLowerCase()]) return { type: 'func', val: p.toLowerCase(), raw: p };
        if (OPERATORS[p]) return { type: 'op', val: p, raw: p };
        return { type: 'var', val: p, raw: p };
      });
    } else {
      // Could be an infix expression, convert first
      const sy = shuntingYard(tokenise(trimmed));
      tokens = sy.postfix;
    }
  }

  const valStack = new Stack();
  const steps = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === 'num') {
      valStack.push(tok.val);
      steps.push({
        step: i + 1,
        token: tok.raw,
        action: `Push number ${fmt(tok.val)} onto stack`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'func') {
      const fnMeta = FUNCTIONS[tok.val];
      if (!fnMeta) throw new Error(`Unknown function: ${tok.val}`);
      if (valStack.isEmpty()) throw new Error(`Not enough operands for ${tok.val}`);
      const a = valStack.pop();
      const r = fnMeta.fn(a);
      valStack.push(r);
      steps.push({
        step: i + 1,
        token: tok.raw,
        action: `${tok.val}(${fmt(a)}) = ${fmt(r)}`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'func_post' && tok.val === 'fact') {
      if (valStack.isEmpty()) throw new Error('Not enough operands for factorial');
      const a = valStack.pop();
      const r = factorial(a);
      valStack.push(r);
      steps.push({
        step: i + 1,
        token: '!',
        action: `${fmt(a)}! = ${fmt(r)}`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'op') {
      if (valStack.size() < 2) throw new Error(`Operator '${tok.raw}' requires 2 operands`);
      const b = valStack.pop();
      const a = valStack.pop();
      const opMeta = OPERATORS[tok.val];
      if (!opMeta) throw new Error(`Unknown operator: ${tok.val}`);
      const r = opMeta.fn(a, b);
      valStack.push(r);
      steps.push({
        step: i + 1,
        token: tok.raw,
        action: `Pop ${fmt(b)} and ${fmt(a)}: ${fmt(a)} ${tok.raw} ${fmt(b)} = ${fmt(r)}`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'var') {
      throw new Error(`Cannot numerically evaluate variable "${tok.val}" without a value`);
    }
  }

  if (valStack.size() === 0) throw new Error('Empty postfix expression');
  if (valStack.size() !== 1) throw new Error(`Malformed postfix expression (remaining items: ${valStack.size()})`);

  return { result: fmt(valStack.pop()), steps };
}

// ── Prefix Evaluator ──────────────────────────────────────────────────────────
// Evaluates prefix expression by scanning Right to Left
function evalPrefix(prefixInput) {
  let tokens = [];
  if (Array.isArray(prefixInput)) {
    tokens = prefixInput;
  } else if (typeof prefixInput === 'string') {
    const trimmed = prefixInput.trim();
    if (trimmed.includes(' ')) {
      const parts = trimmed.split(/\s+/);
      tokens = parts.map(p => {
        if (!isNaN(p)) return { type: 'num', val: parseFloat(p), raw: p };
        if (FUNCTIONS[p.toLowerCase()]) return { type: 'func', val: p.toLowerCase(), raw: p };
        if (OPERATORS[p]) return { type: 'op', val: p, raw: p };
        return { type: 'var', val: p, raw: p };
      });
    } else {
      const pref = infixToPrefix(trimmed);
      tokens = pref.prefix;
    }
  }

  const valStack = new Stack();
  const steps = [];

  // Right to Left scan
  let stepCount = 1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const tok = tokens[i];

    if (tok.type === 'num') {
      valStack.push(tok.val);
      steps.push({
        step: stepCount++,
        token: tok.raw,
        action: `Push number ${fmt(tok.val)} onto stack`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'func') {
      const fnMeta = FUNCTIONS[tok.val];
      if (!fnMeta) throw new Error(`Unknown function: ${tok.val}`);
      if (valStack.isEmpty()) throw new Error(`Not enough operands for ${tok.val}`);
      const a = valStack.pop();
      const r = fnMeta.fn(a);
      valStack.push(r);
      steps.push({
        step: stepCount++,
        token: tok.raw,
        action: `${tok.val}(${fmt(a)}) = ${fmt(r)}`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'op') {
      if (valStack.size() < 2) throw new Error(`Operator '${tok.raw}' requires 2 operands`);
      // In prefix right-to-left scan, first popped is operand A, second popped is operand B
      const a = valStack.pop();
      const b = valStack.pop();
      const opMeta = OPERATORS[tok.val];
      if (!opMeta) throw new Error(`Unknown operator: ${tok.val}`);
      const r = opMeta.fn(a, b);
      valStack.push(r);
      steps.push({
        step: stepCount++,
        token: tok.raw,
        action: `Pop ${fmt(a)} and ${fmt(b)}: ${fmt(a)} ${tok.raw} ${fmt(b)} = ${fmt(r)}`,
        stack: valStack.snapshot().map(fmt),
      });

    } else if (tok.type === 'var') {
      throw new Error(`Cannot numerically evaluate variable "${tok.val}" without a value`);
    }
  }

  if (valStack.size() === 0) throw new Error('Empty prefix expression');
  if (valStack.size() !== 1) throw new Error(`Malformed prefix expression (remaining items: ${valStack.size()})`);

  return { result: fmt(valStack.pop()), steps };
}

// ── Expression Tree Construction & Traversals ─────────────────────────────────
function buildExpressionTree(expression) {
  // If expression is infix, convert to postfix first
  let postfixTokens;
  const trimmed = String(expression).trim();
  if (trimmed.includes(' ') && !/[()+\-*\/^]/.test(trimmed)) {
    // Raw postfix tokens
    postfixTokens = trimmed.split(/\s+/).map(p => ({
      val: p,
      raw: p,
      type: (!isNaN(p) || /^[a-zA-Z]$/.test(p)) ? 'operand' : 'operator'
    }));
  } else {
    const sy = shuntingYard(tokenise(trimmed));
    postfixTokens = sy.postfix;
  }

  const nodeStack = new Stack();

  for (const tok of postfixTokens) {
    if (tok.type === 'num' || tok.type === 'var') {
      nodeStack.push(new TreeNode(tok.raw, 'operand'));
    } else if (tok.type === 'func' || tok.type === 'func_post') {
      if (nodeStack.isEmpty()) throw new Error(`Malformed tree: operand missing for ${tok.raw}`);
      const child = nodeStack.pop();
      const node = new TreeNode(tok.raw, 'function');
      node.left = child;
      nodeStack.push(node);
    } else if (tok.type === 'op') {
      if (nodeStack.size() < 2) throw new Error(`Malformed tree: insufficient operands for ${tok.raw}`);
      const right = nodeStack.pop();
      const left = nodeStack.pop();
      const node = new TreeNode(tok.raw, 'operator');
      node.left = left;
      node.right = right;
      nodeStack.push(node);
    }
  }

  if (nodeStack.size() !== 1) throw new Error('Invalid expression for tree generation');
  const root = nodeStack.pop();

  // Traversals
  const inorderList = [];
  const preorderList = [];
  const postorderList = [];

  function traverse(node) {
    if (!node) return;
    preorderList.push(node.val);
    if (node.left) traverse(node.left);
    inorderList.push(node.val);
    if (node.right) traverse(node.right);
    postorderList.push(node.val);
  }
  traverse(root);

  // Metrics
  function getDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getDepth(node.left), getDepth(node.right));
  }
  function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }
  function countLeaves(node) {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return countLeaves(node.left) + countLeaves(node.right);
  }

  // Serialise tree for frontend SVG rendering
  function serialize(node) {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      type: node.type,
      left: serialize(node.left),
      right: serialize(node.right),
    };
  }

  return {
    root: serialize(root),
    traversals: {
      inorder: inorderList.join(' '),
      preorder: preorderList.join(' '),
      postorder: postorderList.join(' '),
    },
    metrics: {
      depth: getDepth(root),
      totalNodes: countNodes(root),
      leaves: countLeaves(root),
      internalNodes: countNodes(root) - countLeaves(root),
    }
  };
}

// ── Master Calculate Function ─────────────────────────────────────────────────
function calculate(expression) {
  const tokens = tokenise(expression);
  const { postfix, postfixString, steps: sySteps } = shuntingYard(tokens);
  const { prefixString, steps: prefixSteps } = infixToPrefix(expression);
  const { result, steps: evalSteps } = evalPostfix(postfix);

  let tree = null;
  try {
    tree = buildExpressionTree(expression);
  } catch (_) {
    // Tree generation is optional for complex or unsupported expressions
  }

  return {
    expression,
    tokens: tokens.map(t => ({ type: t.type, value: t.raw })),
    postfix: postfixString,
    prefix: prefixString,
    sySteps,
    prefixSteps,
    evalSteps,
    result: fmt(result),
    tree,
  };
}

module.exports = {
  Stack,
  TreeNode,
  tokenise,
  shuntingYard,
  infixToPrefix,
  evalPostfix,
  evalPrefix,
  buildExpressionTree,
  calculate,
  fmt
};
