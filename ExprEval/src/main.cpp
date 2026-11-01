#include "../include/ExpressionParser.h"
#include "../include/InfixConverter.h"
#include "../include/ExpressionEvaluator.h"
#include "../include/ExpressionTree.h"
#include "../include/StackVisualizer.h"
#include "../include/HistoryManager.h"

#include <iostream>
#include <string>

void runTests() {
    std::cout << "\n==========================================" << std::endl;
    std::cout << "  RUNNING SPECIFICATION TEST CASES (Sec 10)" << std::endl;
    std::cout << "==========================================" << std::endl;

    std::vector<std::string> testCases = {
        "10 + 20",
        "10 + 20 * 5",
        "(10 + 20) * 5",
        "((10 + 20) * 5) - 10",
        "10.5 + 2.5",
        "2 ^ 3",
        "2 ^ 3 ^ 2",
        "100 / 5",
        "100 / 0",      // Error case
        "(10 + 20",     // Unbalanced paren
        "10 + * 5"      // Consecutive ops
    };

    for (const auto& expr : testCases) {
        std::cout << "\n>>> Testing: " << expr << std::endl;
        std::string err;
        if (!ExpressionParser::validateSyntax(expr, err)) {
            std::cout << "    [Validation Error]: " << err << std::endl;
            continue;
        }

        std::vector<ConversionStep> convSteps;
        std::string postfix = InfixConverter::infixToPostfix(expr, convSteps);
        std::string prefix = InfixConverter::infixToPrefix(expr, convSteps);
        std::cout << "    Postfix: " << postfix << std::endl;
        std::cout << "    Prefix:  " << prefix << std::endl;

        std::vector<EvaluationStep> evalSteps;
        try {
            double res = ExpressionEvaluator::evaluatePostfix(postfix, evalSteps);
            std::cout << "    Result:  " << res << std::endl;
        } catch (const std::exception& e) {
            std::cout << "    [Evaluation Error]: " << e.what() << std::endl;
        }
    }
    std::cout << "\n==========================================\n" << std::endl;
}

int main() {
    std::cout << "======================================================" << std::endl;
    std::cout << "  ExprEval - Smart Expression Converter & Evaluator   " << std::endl;
    std::cout << "  DSA Mini Project Core Engine                        " << std::endl;
    std::cout << "======================================================" << std::endl;

    HistoryManager history;
    int choice = 0;

    while (true) {
        std::cout << "\n1. Evaluate & Convert Mathematical Expression" << std::endl;
        std::cout << "2. Run Specification Test Suite (Section 10)" << std::endl;
        std::cout << "3. View Expression History" << std::endl;
        std::cout << "4. Exit" << std::endl;
        std::cout << "Enter your choice: ";
        if (!(std::cin >> choice)) break;
        std::cin.ignore();

        if (choice == 1) {
            std::cout << "\nEnter Expression (e.g. (10 + 20) * 5 or 2 ^ 3 + 4 * 5): ";
            std::string expr;
            std::getline(std::cin, expr);

            std::string err;
            if (!ExpressionParser::validateSyntax(expr, err)) {
                std::cout << "[SYNTAX ERROR]: " << err << std::endl;
                continue;
            }

            std::vector<ConversionStep> convSteps;
            std::string postfix = InfixConverter::infixToPostfix(expr, convSteps);
            std::string prefix = InfixConverter::infixToPrefix(expr, convSteps);

            std::cout << "\n--- Conversion Results ---" << std::endl;
            std::cout << "Infix:   " << expr << std::endl;
            std::cout << "Postfix: " << postfix << std::endl;
            std::cout << "Prefix:  " << prefix << std::endl;

            // Stack Visualization of Conversion
            StackVisualizer::displayConversionSteps(convSteps);

            // Evaluation
            std::vector<EvaluationStep> evalSteps;
            std::string resultStr = "N/A";
            try {
                double res = ExpressionEvaluator::evaluatePostfix(postfix, evalSteps);
                resultStr = std::to_string(res);
                std::cout << "\n--- Evaluation Result: " << res << " ---" << std::endl;
                StackVisualizer::displayEvaluationSteps(evalSteps);
            } catch (const std::exception& e) {
                std::cout << "\n--- Evaluation: " << e.what() << " ---" << std::endl;
                resultStr = e.what();
            }

            // Expression Tree
            ExpressionTree tree;
            if (tree.buildFromPostfix(postfix)) {
                std::cout << "\n--- Expression Tree Hierarchy ---" << std::endl;
                tree.printAsciiTree();
            }

            history.addRecord(expr, postfix, prefix, resultStr);

        } else if (choice == 2) {
            runTests();
        } else if (choice == 3) {
            const auto& records = history.getRecords();
            std::cout << "\n--- Expression History (" << records.size() << ") ---" << std::endl;
            if (records.empty()) {
                std::cout << "No calculations recorded yet." << std::endl;
            } else {
                for (size_t i = 0; i < records.size(); ++i) {
                    std::cout << "[" << records[i].timestamp << "] Infix: " << records[i].infix
                              << " -> Postfix: " << records[i].postfix 
                              << " = " << records[i].result << std::endl;
                }
            }
        } else if (choice == 4) {
            std::cout << "Exiting ExprEval. Goodbye!" << std::endl;
            break;
        }
    }

    return 0;
}
