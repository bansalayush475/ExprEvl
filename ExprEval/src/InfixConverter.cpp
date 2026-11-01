#include "../include/InfixConverter.h"
#include <algorithm>
#include <stack>

static std::vector<std::string> stackToVector(std::stack<std::string> st) {
    std::vector<std::string> v;
    while (!st.empty()) {
        v.push_back(st.top());
        st.pop();
    }
    std::reverse(v.begin(), v.end());
    return v;
}

std::string InfixConverter::infixToPostfix(const std::string& expression, std::vector<ConversionStep>& steps) {
    std::vector<Token> tokens = ExpressionParser::tokenize(expression);
    std::stack<std::string> opStack;
    std::vector<std::string> output;

    for (const auto& token : tokens) {
        if (token.type == TokenType::Number || token.type == TokenType::Variable) {
            output.push_back(token.value);
            steps.push_back({
                token.value,
                "Push operand '" + token.value + "' to output",
                stackToVector(opStack),
                output
            });
        } else if (token.type == TokenType::LeftParen) {
            opStack.push("(");
            steps.push_back({
                "(",
                "Push '(' onto operator stack",
                stackToVector(opStack),
                output
            });
        } else if (token.type == TokenType::RightParen) {
            while (!opStack.empty() && opStack.top() != "(") {
                output.push_back(opStack.top());
                steps.push_back({
                    ")",
                    "Pop operator '" + opStack.top() + "' to output until '('",
                    stackToVector(opStack),
                    output
                });
                opStack.pop();
            }
            if (!opStack.empty()) opStack.pop(); // discard '('
            steps.push_back({
                ")",
                "Discard matching ')' and '('",
                stackToVector(opStack),
                output
            });
        } else if (token.type == TokenType::Operator) {
            int currentPrec = ExpressionParser::getPrecedence(token.value);
            bool rightAssoc = ExpressionParser::isRightAssociative(token.value);

            while (!opStack.empty() && opStack.top() != "(") {
                int topPrec = ExpressionParser::getPrecedence(opStack.top());
                if ((!rightAssoc && topPrec >= currentPrec) || (rightAssoc && topPrec > currentPrec)) {
                    output.push_back(opStack.top());
                    steps.push_back({
                        token.value,
                        "Pop operator '" + opStack.top() + "' (precedence " + std::to_string(topPrec) + " >= " + std::to_string(currentPrec) + ") to output",
                        stackToVector(opStack),
                        output
                    });
                    opStack.pop();
                } else {
                    break;
                }
            }
            opStack.push(token.value);
            steps.push_back({
                token.value,
                "Push operator '" + token.value + "' onto stack",
                stackToVector(opStack),
                output
            });
        }
    }

    while (!opStack.empty()) {
        output.push_back(opStack.top());
        opStack.pop();
        steps.push_back({
            "(end)",
            "Drain remaining operator '" + output.back() + "' to output",
            stackToVector(opStack),
            output
        });
    }

    std::string result = "";
    for (size_t i = 0; i < output.size(); ++i) {
        if (i > 0) result += " ";
        result += output[i];
    }
    return result;
}

std::string InfixConverter::infixToPrefix(const std::string& expression, std::vector<ConversionStep>& steps) {
    std::vector<Token> originalTokens = ExpressionParser::tokenize(expression);
    std::vector<Token> reversedTokens;

    // Step 1: Reverse tokens and invert brackets
    for (int i = static_cast<int>(originalTokens.size()) - 1; i >= 0; --i) {
        Token tok = originalTokens[i];
        if (tok.type == TokenType::LeftParen) {
            tok.type = TokenType::RightParen;
            tok.value = ")";
        } else if (tok.type == TokenType::RightParen) {
            tok.type = TokenType::LeftParen;
            tok.value = "(";
        }
        reversedTokens.push_back(tok);
    }

    std::stack<std::string> opStack;
    std::vector<std::string> output;

    for (const auto& token : reversedTokens) {
        if (token.type == TokenType::Number || token.type == TokenType::Variable) {
            output.push_back(token.value);
            steps.push_back({token.value, "Push operand '" + token.value + "' to output", stackToVector(opStack), output});
        } else if (token.type == TokenType::LeftParen) {
            opStack.push("(");
            steps.push_back({"(", "Push '(' onto stack", stackToVector(opStack), output});
        } else if (token.type == TokenType::RightParen) {
            while (!opStack.empty() && opStack.top() != "(") {
                output.push_back(opStack.top());
                steps.push_back({")", "Pop '" + opStack.top() + "' to output", stackToVector(opStack), output});
                opStack.pop();
            }
            if (!opStack.empty()) opStack.pop();
        } else if (token.type == TokenType::Operator) {
            int currentPrec = ExpressionParser::getPrecedence(token.value);
            bool rightAssoc = ExpressionParser::isRightAssociative(token.value);

            while (!opStack.empty() && opStack.top() != "(") {
                int topPrec = ExpressionParser::getPrecedence(opStack.top());
                if ((!rightAssoc && topPrec > currentPrec) || (rightAssoc && topPrec >= currentPrec)) {
                    output.push_back(opStack.top());
                    opStack.pop();
                } else {
                    break;
                }
            }
            opStack.push(token.value);
            steps.push_back({token.value, "Push operator '" + token.value + "' onto stack", stackToVector(opStack), output});
        }
    }

    while (!opStack.empty()) {
        output.push_back(opStack.top());
        opStack.pop();
    }

    std::reverse(output.begin(), output.end());
    std::string prefixResult = "";
    for (size_t i = 0; i < output.size(); ++i) {
        if (i > 0) prefixResult += " ";
        prefixResult += output[i];
    }
    return prefixResult;
}
