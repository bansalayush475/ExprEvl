# ExprEval — Smart Expression Converter & Evaluator
> **DSA Mini Project**: Mathematical Expression Parsing, Conversion, Evaluation, and Stack/Tree Visualization.

[![DSA Project](https://img.shields.io/badge/DSA-Stack%20%26%20Binary%20Tree-6366f1.svg)](https://github.com/bansalayush475/ExprEvl)
[![C++17](https://img.shields.io/badge/C%2B%2B-17%20Standard-blue.svg)](https://github.com/bansalayush475/ExprEvl)
[![Node.js](https://img.shields.io/badge/Web%20Studio-Node%20%2B%20Express-10b981.svg)](https://github.com/bansalayush475/ExprEvl)

---

## 1. Project Overview

**ExprEval** is a mathematical expression engine and interactive visualization studio built for Data Structures & Algorithms coursework and technical presentations.

The application allows users to:
1. Input complex mathematical and algebraic expressions (with integers, decimals, variables, and nested parentheses).
2. Simultaneously convert expressions between **Infix**, **Postfix (RPN)**, and **Prefix (Polish Notation)**.
3. Evaluate expressions with linear $\mathcal{O}(N)$ complexity.
4. Visualize internal **LIFO Stack operations** step-by-step with interactive playback (`▶ Play`, `Next`, `Prev`).
5. Construct and inspect **Binary Expression Trees (AST)** with **Inorder**, **Preorder**, and **Postorder** traversals.

---

## 2. Project Architecture

This repository includes both the **Web Visualization Studio** (for live demos and presentations) and the **Modular C++ Core Engine** (for coursework grading and deliverables).

```
ExprEvl/
├── ExprEval/                      # Modular C++ Core Engine (Section 8 & 11)
│   ├── include/
│   │   ├── ExpressionParser.h     # Lexing, tokenization & syntax validation
│   │   ├── InfixConverter.h       # Shunting-Yard Infix to Postfix/Prefix
│   │   ├── ExpressionEvaluator.h  # Stack-based evaluation
│   │   ├── ExpressionTree.h       # Binary syntax tree construction & traversals
│   │   ├── StackVisualizer.h      # Console step-by-step stack tracer
│   │   └── HistoryManager.h       # History audit logger
│   ├── src/
│   │   ├── ExpressionParser.cpp
│   │   ├── InfixConverter.cpp
│   │   ├── ExpressionEvaluator.cpp
│   │   ├── ExpressionTree.cpp
│   │   ├── StackVisualizer.cpp
│   │   ├── HistoryManager.cpp
│   │   └── main.cpp               # Interactive CLI + Section 10 Test Suite
│   ├── CMakeLists.txt             # CMake build configuration
│   └── PROJECT_REPORT.md          # Comprehensive report & Viva Q&A
│
├── public/                        # Presentation Web Studio
│   ├── index.html                 # Unified single-dashboard UI
│   └── style.css                  # Modern human-crafted Slate & Indigo theme
├── routes/
│   └── calculate.js               # REST API endpoints
├── src/
│   ├── calculator.js              # Pure JavaScript DSA engine
│   └── server.js                  # Express backend server
├── package.json
└── README.md
```

---

## 3. Core Algorithms & Time/Space Complexity

For an expression containing $N$ tokens:

| Algorithm / Component | Time Complexity | Auxiliary Space | Key Data Structure |
|---|---|---|---|
| **Tokenization & Validation** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Parenthesis Balance Stack |
| **Infix $\rightarrow$ Postfix (Shunting-Yard)** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Operator Stack (LIFO) |
| **Infix $\rightarrow$ Prefix** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Operator Stack & Reversal Buffer |
| **Postfix Evaluation** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Operand Value Stack |
| **Prefix Evaluation** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Operand Value Stack |
| **Binary Expression Tree** | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | Node Pointer Stack |

### Operator Precedence & Associativity

| Operator | Precedence | Associativity | Description |
|---|---|---|---|
| `^` | **3 (Highest)** | **Right** ($2 \wedge 3 \wedge 2 = 2 \wedge (3 \wedge 2) = 512$) | Exponentiation |
| `*`, `/`, `%` | **2 (Medium)** | **Left** | Multiplication, Division, Modulo |
| `+`, `-` | **1 (Lowest)** | **Left** | Addition, Subtraction |

---

## 4. Quick Start

### Running the Web Presentation Studio
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
npm start
```
Open **`http://localhost:3000`** (or `http://localhost:3001` if port 3000 is occupied).

### Building the C++ Engine (CMake)
```bash
cd ExprEval
mkdir build && cd build
cmake ..
cmake --build .
./ExprEval
```

---

## 5. Specification Test Cases (Section 10)

| Test Input | Postfix | Prefix | Result | Notes |
|---|---|---|---|---|
| `10 + 20` | `10 20 +` | `+ 10 20` | `30` | Basic addition |
| `10 + 20 * 5` | `10 20 5 * +` | `+ 10 * 20 5` | `110` | Precedence handling |
| `(10 + 20) * 5` | `10 20 + 5 *` | `* + 10 20 5` | `150` | Parentheses override |
| `2 ^ 3 ^ 2` | `2 3 2 ^ ^` | `^ 2 ^ 3 2` | `512` | Right-associativity |
| `100 / 0` | — | — | `Error` | Division by zero caught |
| `(10 + 20` | — | — | `Error` | Unbalanced parentheses caught |
