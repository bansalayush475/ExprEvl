#ifndef INFIX_CONVERTER_H
#define INFIX_CONVERTER_H

#include "ExpressionParser.h"
#include <string>
#include <vector>

struct ConversionStep {
    std::string token;
    std::string action;
    std::vector<std::string> stackState;
    std::vector<std::string> outputState;
};

class InfixConverter {
public:
    static std::string infixToPostfix(const std::string& expression, std::vector<ConversionStep>& steps);
    static std::string infixToPrefix(const std::string& expression, std::vector<ConversionStep>& steps);
};

#endif // INFIX_CONVERTER_H
