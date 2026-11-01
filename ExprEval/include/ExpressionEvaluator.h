#ifndef EXPRESSION_EVALUATOR_H
#define EXPRESSION_EVALUATOR_H

#include <string>
#include <vector>

struct EvaluationStep {
    int stepNumber;
    std::string token;
    std::string action;
    std::vector<double> stackState;
};

class ExpressionEvaluator {
public:
    static double evaluatePostfix(const std::string& postfixExpr, std::vector<EvaluationStep>& steps);
    static double evaluatePrefix(const std::string& prefixExpr, std::vector<EvaluationStep>& steps);
};

#endif // EXPRESSION_EVALUATOR_H
