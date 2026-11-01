#include "../include/ExpressionEvaluator.h"
#include <cmath>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <vector>
#include <algorithm>

static std::vector<double> valStackToVector(std::stack<double> st) {
    std::vector<double> v;
    while (!st.empty()) {
        v.push_back(st.top());
        st.pop();
    }
    std::reverse(v.begin(), v.end());
    return v;
}

static double applyOp(double a, double b, const std::string& op) {
    if (op == "+") return a + b;
    if (op == "-") return a - b;
    if (op == "*") return a * b;
    if (op == "/") {
        if (std::abs(b) < 1e-12) throw std::runtime_error("Division by zero");
        return a / b;
    }
    if (op == "%") {
        if (std::abs(b) < 1e-12) throw std::runtime_error("Division by zero in modulus");
        return std::fmod(a, b);
    }
    if (op == "^") return std::pow(a, b);
    throw std::runtime_error("Unknown operator: " + op);
}

double ExpressionEvaluator::evaluatePostfix(const std::string& postfixExpr, std::vector<EvaluationStep>& steps) {
    std::istringstream iss(postfixExpr);
    std::string token;
    std::stack<double> valStack;
    int stepNum = 1;

    while (iss >> token) {
        if (token == "+" || token == "-" || token == "*" || token == "/" || token == "%" || token == "^") {
            if (valStack.size() < 2) {
                throw std::runtime_error("Malformed postfix expression: not enough operands for '" + token + "'");
            }
            double b = valStack.top(); valStack.pop();
            double a = valStack.top(); valStack.pop();
            double res = applyOp(a, b, token);
            valStack.push(res);

            steps.push_back({
                stepNum++,
                token,
                "Pop " + std::to_string(b) + " and " + std::to_string(a) + ", compute " + std::to_string(a) + " " + token + " " + std::to_string(b) + " = " + std::to_string(res),
                valStackToVector(valStack)
            });
        } else {
            try {
                double val = std::stod(token);
                valStack.push(val);
                steps.push_back({
                    stepNum++,
                    token,
                    "Push number " + token + " onto stack",
                    valStackToVector(valStack)
                });
            } catch (...) {
                throw std::runtime_error("Cannot numerically evaluate algebraic variable '" + token + "' without value.");
            }
        }
    }

    if (valStack.size() != 1) {
        throw std::runtime_error("Invalid postfix expression: mismatched operands and operators.");
    }
    return valStack.top();
}

double ExpressionEvaluator::evaluatePrefix(const std::string& prefixExpr, std::vector<EvaluationStep>& steps) {
    std::istringstream iss(prefixExpr);
    std::string tok;
    std::vector<std::string> tokens;
    while (iss >> tok) tokens.push_back(tok);

    std::stack<double> valStack;
    int stepNum = 1;

    // Scan Right to Left
    for (int i = static_cast<int>(tokens.size()) - 1; i >= 0; --i) {
        std::string token = tokens[i];
        if (token == "+" || token == "-" || token == "*" || token == "/" || token == "%" || token == "^") {
            if (valStack.size() < 2) {
                throw std::runtime_error("Malformed prefix expression: not enough operands for '" + token + "'");
            }
            double a = valStack.top(); valStack.pop();
            double b = valStack.top(); valStack.pop();
            double res = applyOp(a, b, token);
            valStack.push(res);

            steps.push_back({
                stepNum++,
                token,
                "Pop " + std::to_string(a) + " and " + std::to_string(b) + ", compute " + std::to_string(a) + " " + token + " " + std::to_string(b) + " = " + std::to_string(res),
                valStackToVector(valStack)
            });
        } else {
            try {
                double val = std::stod(token);
                valStack.push(val);
                steps.push_back({
                    stepNum++,
                    token,
                    "Push number " + token + " onto stack",
                    valStackToVector(valStack)
                });
            } catch (...) {
                throw std::runtime_error("Cannot numerically evaluate algebraic variable '" + token + "' without value.");
            }
        }
    }

    if (valStack.size() != 1) {
        throw std::runtime_error("Invalid prefix expression: mismatched operands and operators.");
    }
    return valStack.top();
}
