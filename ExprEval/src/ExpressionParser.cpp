#include "../include/ExpressionParser.h"
#include <cctype>
#include <sstream>
#include <stack>
#include <stdexcept>

bool ExpressionParser::isOperator(char ch) {
    return ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '%' || ch == '^';
}

int ExpressionParser::getPrecedence(const std::string& op) {
    if (op == "^") return 3;
    if (op == "*" || op == "/" || op == "%") return 2;
    if (op == "+" || op == "-") return 1;
    return 0;
}

bool ExpressionParser::isRightAssociative(const std::string& op) {
    return op == "^";
}

bool ExpressionParser::validateSyntax(const std::string& expr, std::string& err) {
    if (expr.empty()) {
        err = "Expression cannot be empty.";
        return false;
    }

    std::stack<char> parenStack;
    bool lastWasOp = true; // start expects number, unary minus, or '('
    int parenBalance = 0;

    for (size_t i = 0; i < expr.length(); ++i) {
        char ch = expr[i];
        if (std::isspace(static_cast<unsigned char>(ch))) continue;

        if (ch == '(') {
            parenStack.push(ch);
            parenBalance++;
            lastWasOp = true;
        } else if (ch == ')') {
            if (parenStack.empty()) {
                err = "Mismatched parentheses: unexpected ')' at position " + std::to_string(i);
                return false;
            }
            parenStack.pop();
            parenBalance--;
            lastWasOp = false;
        } else if (isOperator(ch)) {
            if (lastWasOp && ch != '-' && ch != '+') {
                err = "Consecutive operators or misplaced operator '" + std::string(1, ch) + "' at position " + std::to_string(i);
                return false;
            }
            lastWasOp = true;
        } else if (std::isdigit(static_cast<unsigned char>(ch)) || ch == '.' || std::isalpha(static_cast<unsigned char>(ch))) {
            lastWasOp = false;
        } else {
            err = "Invalid character '" + std::string(1, ch) + "' at position " + std::to_string(i);
            return false;
        }
    }

    if (!parenStack.empty()) {
        err = "Unbalanced parentheses: missing ')'";
        return false;
    }
    if (lastWasOp) {
        err = "Expression cannot end with an operator.";
        return false;
    }
    return true;
}

std::vector<Token> ExpressionParser::tokenize(const std::string& expr) {
    std::vector<Token> tokens;
    size_t i = 0;

    while (i < expr.length()) {
        char ch = expr[i];
        if (std::isspace(static_cast<unsigned char>(ch))) {
            i++;
            continue;
        }

        // Unary sign check
        if ((ch == '-' || ch == '+') &&
            (tokens.empty() || tokens.back().type == TokenType::Operator || tokens.back().type == TokenType::LeftParen)) {
            char sign = ch;
            i++;
            // Check if followed by digit
            if (i < expr.length() && (std::isdigit(static_cast<unsigned char>(expr[i])) || expr[i] == '.')) {
                std::string numStr = (sign == '-') ? "-" : "";
                while (i < expr.length() && (std::isdigit(static_cast<unsigned char>(expr[i])) || expr[i] == '.')) {
                    numStr += expr[i++];
                }
                tokens.push_back({TokenType::Number, numStr, std::stod(numStr)});
            } else {
                tokens.push_back({TokenType::Number, "0", 0.0});
                tokens.push_back({TokenType::Operator, std::string(1, sign), 0.0});
            }
            continue;
        }

        // Numbers (integers & decimals)
        if (std::isdigit(static_cast<unsigned char>(ch)) || ch == '.') {
            std::string numStr = "";
            while (i < expr.length() && (std::isdigit(static_cast<unsigned char>(expr[i])) || expr[i] == '.')) {
                numStr += expr[i++];
            }
            tokens.push_back({TokenType::Number, numStr, std::stod(numStr)});
            continue;
        }

        // Operators
        if (isOperator(ch)) {
            tokens.push_back({TokenType::Operator, std::string(1, ch), 0.0});
            i++;
            continue;
        }

        // Parentheses
        if (ch == '(') {
            tokens.push_back({TokenType::LeftParen, "(", 0.0});
            i++;
            continue;
        }
        if (ch == ')') {
            tokens.push_back({TokenType::RightParen, ")", 0.0});
            i++;
            continue;
        }

        // Variables
        if (std::isalpha(static_cast<unsigned char>(ch))) {
            tokens.push_back({TokenType::Variable, std::string(1, ch), 0.0});
            i++;
            continue;
        }

        i++;
    }
    return tokens;
}
