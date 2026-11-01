#ifndef HISTORY_MANAGER_H
#define HISTORY_MANAGER_H

#include <string>
#include <vector>

struct HistoryRecord {
    std::string infix;
    std::string postfix;
    std::string prefix;
    std::string result;
    std::string timestamp;
};

class HistoryManager {
private:
    std::vector<HistoryRecord> records;
    const size_t maxHistory = 50;

public:
    void addRecord(const std::string& infix, const std::string& postfix, const std::string& prefix, const std::string& result);
    const std::vector<HistoryRecord>& getRecords() const;
    void clear();
};

#endif // HISTORY_MANAGER_H
