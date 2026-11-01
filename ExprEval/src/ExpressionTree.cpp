#include "../include/ExpressionTree.h"
#include <algorithm>
#include <iostream>
#include <sstream>
#include <stack>

ExpressionTree::ExpressionTree() : root(nullptr) {}

ExpressionTree::~ExpressionTree() {
    destroyTree(root);
}

void ExpressionTree::destroyTree(TreeNode* node) {
    if (!node) return;
    destroyTree(node->left);
    destroyTree(node->right);
    delete node;
}

bool ExpressionTree::buildFromPostfix(const std::string& postfix) {
    destroyTree(root);
    root = nullptr;

    std::istringstream iss(postfix);
    std::string token;
    std::stack<TreeNode*> st;

    while (iss >> token) {
        if (token == "+" || token == "-" || token == "*" || token == "/" || token == "%" || token == "^") {
            if (st.size() < 2) return false;
            TreeNode* rightChild = st.top(); st.pop();
            TreeNode* leftChild = st.top(); st.pop();
            TreeNode* opNode = new TreeNode(token, true);
            opNode->left = leftChild;
            opNode->right = rightChild;
            st.push(opNode);
        } else {
            st.push(new TreeNode(token, false));
        }
    }

    if (st.size() != 1) return false;
    root = st.top();
    return true;
}

void ExpressionTree::inorderHelper(TreeNode* node, std::vector<std::string>& res) const {
    if (!node) return;
    if (node->isOperator) res.push_back("(");
    inorderHelper(node->left, res);
    res.push_back(node->value);
    inorderHelper(node->right, res);
    if (node->isOperator) res.push_back(")");
}

void ExpressionTree::preorderHelper(TreeNode* node, std::vector<std::string>& res) const {
    if (!node) return;
    res.push_back(node->value);
    preorderHelper(node->left, res);
    preorderHelper(node->right, res);
}

void ExpressionTree::postorderHelper(TreeNode* node, std::vector<std::string>& res) const {
    if (!node) return;
    postorderHelper(node->left, res);
    postorderHelper(node->right, res);
    res.push_back(node->value);
}

std::string ExpressionTree::getInorder() const {
    std::vector<std::string> v;
    inorderHelper(root, v);
    std::string res;
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) res += " ";
        res += v[i];
    }
    return res;
}

std::string ExpressionTree::getPreorder() const {
    std::vector<std::string> v;
    preorderHelper(root, v);
    std::string res;
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) res += " ";
        res += v[i];
    }
    return res;
}

std::string ExpressionTree::getPostorder() const {
    std::vector<std::string> v;
    postorderHelper(root, v);
    std::string res;
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) res += " ";
        res += v[i];
    }
    return res;
}

int ExpressionTree::depthHelper(TreeNode* node) const {
    if (!node) return 0;
    return 1 + std::max(depthHelper(node->left), depthHelper(node->right));
}

int ExpressionTree::countNodesHelper(TreeNode* node) const {
    if (!node) return 0;
    return 1 + countNodesHelper(node->left) + countNodesHelper(node->right);
}

int ExpressionTree::countLeavesHelper(TreeNode* node) const {
    if (!node) return 0;
    if (!node->left && !node->right) return 1;
    return countLeavesHelper(node->left) + countLeavesHelper(node->right);
}

int ExpressionTree::getDepth() const { return depthHelper(root); }
int ExpressionTree::getTotalNodes() const { return countNodesHelper(root); }
int ExpressionTree::getLeafNodes() const { return countLeavesHelper(root); }
int ExpressionTree::getInternalNodes() const { return getTotalNodes() - getLeafNodes(); }

void ExpressionTree::printAsciiTree() const {
    std::cout << "[Tree Traversals]" << std::endl;
    std::cout << "  Inorder  (Infix):  " << getInorder() << std::endl;
    std::cout << "  Preorder (Prefix): " << getPreorder() << std::endl;
    std::cout << "  Postorder(Postfix):" << getPostorder() << std::endl;
    std::cout << "  Metrics: Depth=" << getDepth() << ", Nodes=" << getTotalNodes() 
              << ", Leaves=" << getLeafNodes() << std::endl;
}
