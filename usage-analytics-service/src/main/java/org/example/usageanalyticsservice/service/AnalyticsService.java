package org.example.usageanalyticsservice.service;

import org.example.usageanalyticsservice.model.UserUsage;
import org.example.usageanalyticsservice.repository.UserUsageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private UserUsageRepository repo;

    // ✅ AVERAGE DATA USAGE
    public double getAverageUsage(Integer userId) {

        List<UserUsage> list =
                repo.findByUserIdOrderByUsageMonthAsc(userId);

        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToDouble(UserUsage::getDataUsedGb)
                .average()
                .orElse(0);
    }

    // ✅ AVERAGE CALL MINUTES
    public double getAverageCallMinutes(Integer userId) {

        List<UserUsage> list =
                repo.findByUserIdOrderByUsageMonthAsc(userId);

        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToDouble(UserUsage::getCallMinutesUsed)
                .average()
                .orElse(0);
    }

    // ✅ AVERAGE SMS USED
    public double getAverageSmsUsed(Integer userId) {

        List<UserUsage> list =
                repo.findByUserIdOrderByUsageMonthAsc(userId);

        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToDouble(UserUsage::getSmsUsed)
                .average()
                .orElse(0);
    }

    // ✅ TOTAL COMPLAINTS
    public int getTotalComplaints(Integer userId) {

        List<UserUsage> list =
                repo.findByUserIdOrderByUsageMonthAsc(userId);

        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToInt(UserUsage::getComplaints)
                .sum();
    }

    // ✅ USAGE HISTORY
    public List<UserUsage> getUsageHistory(Integer userId) {

        return repo.findByUserIdOrderByUsageMonthAsc(userId);
    }
}