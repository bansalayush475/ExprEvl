#ifndef STACK_VISUALIZER_H
#define STACK_VISUALIZER_H

#include "InfixConverter.h"
#include "ExpressionEvaluator.h"
#include <iostream>
#include <vector>
#include <string>

class StackVisualizer {
public:
    static void displayConversionSteps(const std::vector<ConversionStep>& steps);
    static void displayEvaluationSteps(const std::vector<EvaluationStep>& steps);
};

#endif // STACK_VISUALIZER_H
