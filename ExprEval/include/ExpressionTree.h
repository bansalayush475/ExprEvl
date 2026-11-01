#ifndef EXPRESSION_TREE_H
#define EXPRESSION_TREE_H

#include <string>
#include <vector>

struct TreeNode {
    std::string value;
    bool isOperator;
    TreeNode* left;
    TreeNode* right;

    TreeNode(const std::string& val, bool isOp = false)
        : value(val), isOperator(isOp), left(nullptr), right(nullptr) {}
};

class ExpressionTree {
private:
    TreeNode* root;
    void inorderHelper(TreeNode* node, std::vector<std::string>& res) const;
    void preorderHelper(TreeNode* node, std::vector<std::string>& res) const;
    void postorderHelper(TreeNode* node, std::vector<std::string>& res) const;
    int depthHelper(TreeNode* node) const;
    int countNodesHelper(TreeNode* node) const;
    int countLeavesHelper(TreeNode* node) const;
    void destroyTree(TreeNode* node);

public:
    ExpressionTree();
    ~ExpressionTree();

    bool buildFromPostfix(const std::string& postfix);
    std::string getInorder() const;
    std::string getPreorder() const;
    std::string getPostorder() const;

    int getDepth() const;
    int getTotalNodes() const;
    int getLeafNodes() const;
    int getInternalNodes() const;
    void printAsciiTree() const;
};

#endif // EXPRESSION_TREE_H
