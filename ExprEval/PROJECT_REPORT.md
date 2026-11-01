# ExprEval – Smart Expression Converter & Evaluator
## DSA Mini Project Report & Viva Preparation Guide

---

## 1. Project Overview & Abstract

**ExprEval** is a mathematical expression conversion, evaluation, and visualization system. The system implements the **Stack Abstract Data Type (ADT)** to process mathematical expressions across three core notations:
- **Infix Notation:** Human-readable algebraic syntax with operator precedence and nested parentheses.
- **Postfix Notation (Reverse Polish Notation - RPN):** Machine-optimal syntax where operators follow operands, eliminating the need for parentheses.
- **Prefix Notation (Polish Notation):** Prefix syntax where operators precede operands, allowing linear recursive-descent parsing.

The application validates syntax, converts infix expressions using Dijkstra's Shunting-Yard algorithm, evaluates postfix and prefix expressions using operand stacks, and constructs hierarchical Binary Expression Trees with tree traversals.

---

## 2. Theoretical Background & Data Structures

### A. The Stack (LIFO - Last In, First Out)
The stack is the primary data structure utilized throughout the engine:
- **`push(x)`:** Inserts an element to the top of the stack ($\mathcal{O}(1)$).
- **`pop()`:** Removes the element from the top of the stack ($\mathcal{O}(1)$).
- **`peek()` / `top()`:** Inspects the top element without removal ($\mathcal{O}(1)$).
- **Boundary Handling:** Prevents **Stack Underflow** (popping an empty stack) and **Stack Overflow** (pushing to a full stack).

### B. Operator Precedence & Associativity Hierarchy

| Precedence Level | Operators | Associativity | Description |
|---|---|---|---|
| **3 (Highest)** | `^` | **Right** ($A \wedge B \wedge C = A \wedge (B \wedge C)$) | Exponentiation / Power |
| **2 (Medium)** | `*`, `/`, `%` | **Left** ($A * B * C = (A * B) * C$) | Multiplication, Division, Modulo |
| **1 (Lowest)** | `+`, `-` | **Left** ($A + B + C = (A + B) + C$) | Addition, Subtraction |

---

## 3. Algorithm Specifications

### 1. Infix to Postfix Conversion (Dijkstra's Shunting-Yard)
1. Initialize an empty operator stack and an output queue.
2. Scan tokens from left to right:
   - If token is an **operand**, append directly to output.
   - If token is `'('`, push onto the operator stack.
   - If token is `')'`, pop operators from the stack to the output until a `'('` is encountered; discard both parentheses.
   - If token is an **operator** `op1`:
     - While the stack is not empty, top is not `'('`, and (`precedence(top) > precedence(op1)` OR (`precedence(top) == precedence(op1)` AND `op1` is Left-associative)):
       - Pop `top` and append to output.
     - Push `op1` onto the stack.
3. Drain all remaining operators from the stack to the output.

### 2. Infix to Prefix Conversion
1. Reverse the infix token sequence.
2. Swap all opening parentheses `'('` with closing parentheses `')'` and vice versa.
3. Run modified Shunting-Yard: for equal precedence operators, right-associative rule takes precedence during the reversed scan.
4. Reverse the output tokens to produce the final Prefix expression.

### 3. Postfix Evaluation
1. Initialize an empty operand stack.
2. Scan tokens from Left to Right:
   - If token is an **operand**, push onto operand stack.
   - If token is a **binary operator** `op`:
     - Pop operand $B = \text{pop}()$.
     - Pop operand $A = \text{pop}()$.
     - Compute $R = A \text{ op } B$.
     - Push $R$ back onto the stack.
3. The single remaining value on the stack is the final result.

### 4. Prefix Evaluation
1. Initialize an empty operand stack.
2. Scan tokens from **Right to Left**:
   - If token is an **operand**, push onto operand stack.
   - If token is a **binary operator** `op`:
     - Pop operand $A = \text{pop}()$ (first popped).
     - Pop operand $B = \text{pop}()$ (second popped).
     - Compute $R = A \text{ op } B$.
     - Push $R$ back onto the stack.
3. The remaining value on the stack is the final result.

### 5. Binary Expression Tree Construction
- Uses an operand node stack.
- Scans postfix tokens:
  - If operand: create leaf `TreeNode`, push pointer onto stack.
  - If operator: pop right child, pop left child, create parent `TreeNode`, set left and right pointers, push parent pointer back.
- **Traversal Equivalence Theorem:**
  - $\text{Inorder Traversal} (\text{Left} \rightarrow \text{Root} \rightarrow \text{Right}) \equiv \text{Infix Notation}$
  - $\text{Preorder Traversal} (\text{Root} \rightarrow \text{Left} \rightarrow \text{Right}) \equiv \text{Prefix Notation}$
  - $\text{Postorder Traversal} (\text{Left} \rightarrow \text{Right} \rightarrow \text{Root}) \equiv \text{Postfix Notation}$

---

## 4. Complexity Analysis

For an expression containing $n$ tokens:

| Algorithm / Phase | Time Complexity | Auxiliary Space Complexity | Space Justification |
|---|---|---|---|
| **Lexical Tokenization** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Token storage buffer |
| **Syntax Validation** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Parenthesis tracking stack |
| **Infix to Postfix** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Operator stack + output list |
| **Infix to Prefix** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Reverse buffers + operator stack |
| **Postfix Evaluation** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Operand stack |
| **Prefix Evaluation** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | Operand stack |
| **Expression Tree Construction** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $n$ `TreeNode` pointers in memory |

Every token is pushed and popped from the stack at most once, guaranteeing strict linear $\mathcal{O}(n)$ time complexity.

---

## 5. Specification Test Cases

| Test Case | Expression | Postfix Output | Prefix Output | Evaluated Result | Test Status |
|---|---|---|---|---|---|
| **1. Simple addition** | `10 + 20` | `10 20 +` | `+ 10 20` | `30` | Pass |
| **2. Operator precedence** | `10 + 20 * 5` | `10 20 5 * +` | `+ 10 * 20 5` | `110` | Pass |
| **3. Parentheses** | `(10 + 20) * 5` | `10 20 + 5 *` | `* + 10 20 5` | `150` | Pass |
| **4. Nested parentheses** | `((10 + 20) * 5) - 10` | `10 20 + 5 * 10 -` | `- * + 10 20 5 10` | `140` | Pass |
| **5. Decimals** | `10.5 + 2.5` | `10.5 2.5 +` | `+ 10.5 2.5` | `13` | Pass |
| **6. Exponentiation** | `2 ^ 3` | `2 3 ^` | `^ 2 3` | `8` | Pass |
| **7. Right associativity** | `2 ^ 3 ^ 2` | `2 3 2 ^ ^` | `^ 2 ^ 3 2` | `512` ($2^9$) | Pass |
| **8. Division** | `100 / 5` | `100 5 /` | `/ 100 5` | `20` | Pass |
| **9. Division by zero** | `100 / 0` | — | — | `Error: Division by zero` | Caught |
| **10. Unbalanced paren** | `(10 + 20` | — | — | `Error: Unbalanced parentheses` | Caught |
| **11. Consecutive ops** | `10 + * 5` | — | — | `Error: Consecutive operators` | Caught |

---

## 6. Viva Questions & Model Answers

### Q1: Why do we convert Infix to Postfix instead of evaluating Infix directly?
**Answer:** Infix expressions contain operator precedence rules and parentheses that require backtracking or multiple passes to evaluate correctly. Postfix notation (Reverse Polish Notation) eliminates all parentheses and makes operator order linear. A stack machine can evaluate postfix in a single Left-to-Right pass in linear $\mathcal{O}(n)$ time without backtracking.

### Q2: Why is the `^` (power) operator handled differently than `*` or `+` during conversion?
**Answer:** The `^` operator is **right-associative** ($2 \wedge 3 \wedge 2 = 2 \wedge (3 \wedge 2) = 2^9 = 512$, not $(2^3)^2 = 64$). In Shunting-Yard, when an incoming right-associative operator has the **same precedence** as the operator at the top of the stack, the top operator is **not** popped; instead, the incoming operator is pushed on top of it.

### Q3: How does Postfix evaluation differ from Prefix evaluation?
**Answer:**
- **Postfix:** Scanned **Left to Right**. When an operator is encountered, the second operand ($B$) is popped first, followed by the first operand ($A$), and $A \text{ op } B$ is evaluated.
- **Prefix:** Scanned **Right to Left**. When an operator is encountered, the first operand ($A$) is popped first, followed by the second operand ($B$), and $A \text{ op } B$ is evaluated.

### Q4: What is the relationship between Binary Expression Trees and expression notations?
**Answer:**
- In an Expression Tree, internal nodes represent operators, and leaf nodes represent operands.
- An **Inorder traversal** ($\text{Left} \rightarrow \text{Root} \rightarrow \text{Right}$) yields the **Infix** expression.
- A **Preorder traversal** ($\text{Root} \rightarrow \text{Left} \rightarrow \text{Right}$) yields the **Prefix** expression.
- A **Postorder traversal** ($\text{Left} \rightarrow \text{Right} \rightarrow \text{Root}$) yields the **Postfix** expression.

### Q5: What is the Time and Space Complexity of your implementation?
**Answer:**
- **Time Complexity:** $\mathcal{O}(n)$ where $n$ is the number of tokens. Every token is processed in constant time and pushed/popped from the stack at most once.
- **Space Complexity:** $\mathcal{O}(n)$ auxiliary space to store the operator/operand stack, token array, and binary tree nodes.
