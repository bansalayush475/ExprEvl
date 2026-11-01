#include "../include/StackVisualizer.h"
#include <iomanip>
#include <iostream>

void StackVisualizer::displayConversionSteps(const std::vector<ConversionStep>& steps) {
    std::cout << "\n=== Step-by-Step Stack Conversion ===" << std::endl;
    std::cout << std::left << std::setw(6)  << "Step"
              << std::setw(8)  << "Token"
              << std::setw(30) << "Action"
              << std::setw(20) << "Stack (Bottom->Top)"
              << "Output" << std::endl;
    std::cout << std::string(80, '-') << std::endl;

    for (size_t i = 0; i < steps.size(); ++i) {
        const auto& s = steps[i];
        std::string stackStr = "[";
        for (size_t j = 0; j < s.stackState.size(); ++j) {
            if (j > 0) stackStr += ", ";
            stackStr += s.stackState[j];
        }
        stackStr += "]";

        std::string outStr = "";
        for (const auto& o : s.outputState) outStr += o + " ";

        std::cout << std::left << std::setw(6)  << (i + 1)
                  << std::setw(8)  << s.token
                  << std::setw(30) << s.action
                  << std::setw(20) << stackStr
                  << outStr << std::endl;
    }
}

void StackVisualizer::displayEvaluationSteps(const std::vector<EvaluationStep>& steps) {
    std::cout << "\n=== Step-by-Step Stack Evaluation ===" << std::endl;
    std::cout << std::left << std::setw(6)  << "Step"
              << std::setw(8)  << "Token"
              << std::setw(42) << "Operation"
              << "Stack" << std::endl;
    std::cout << std::string(75, '-') << std::endl;

    for (const auto& s : steps) {
        std::string stackStr = "[";
        for (size_t j = 0; j < s.stackState.size(); ++j) {
            if (j > 0) stackStr += ", ";
            stackStr += std::to_string(s.stackState[j]);
        }
        stackStr += "]";

        std::cout << std::left << std::setw(6)  << s.stepNumber
                  << std::setw(8)  << s.token
                  << std::setw(42) << s.action
                  << stackStr << std::endl;
    }
}
