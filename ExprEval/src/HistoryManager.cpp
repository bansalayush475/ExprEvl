#include "../include/HistoryManager.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

void HistoryManager::addRecord(const std::string& infix, const std::string& postfix, const std::string& prefix, const std::string& result) {
    auto now = std::chrono::system_clock::now();
    std::time_t now_time = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&now_time), "%Y-%m-%d %H:%M:%S");

    HistoryRecord record = { infix, postfix, prefix, result, ss.str() };
    records.insert(records.begin(), record);

    if (records.size() > maxHistory) {
        records.pop_back();
    }
}

const std::vector<HistoryRecord>& HistoryManager::getRecords() const {
    return records;
}

void HistoryManager::clear() {
    records.clear();
}
