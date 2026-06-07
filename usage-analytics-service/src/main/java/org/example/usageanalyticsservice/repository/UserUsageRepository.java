package org.example.usageanalyticsservice.repository;

import org.example.usageanalyticsservice.model.UserUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserUsageRepository extends JpaRepository<UserUsage, Integer> {

    List<UserUsage> findByUserIdOrderByUsageMonthAsc(Integer userId);
}