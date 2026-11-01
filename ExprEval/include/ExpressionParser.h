#ifndef EXPRESSION_PARSER_H
#define EXPRESSION_PARSER_H

#include <string>
#include <vector>

enum class TokenType {
    Number,
    Variable,
    Operator,
    LeftParen,
    RightParen
};

struct Token {
    TokenType type;
    std::string value;
    double numValue = 0.0;
};

class ExpressionParser {
public:
    static bool validateSyntax(const std::string& expression, std::string& errorMessage);
    static std::vector<Token> tokenize(const std::string& expression);
    static bool isOperator(char ch);
    static int getPrecedence(const std::string& op);
    static bool isRightAssociative(const std::string& op);
};

#endif // EXPRESSION_PARSER_H
