package org.example.userservice.repository;

import org.example.userservice.model.UserUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserUsageRepository extends JpaRepository<UserUsage, Integer> {

    // 🔥 REQUIRED for microservice
    UserUsage findByUserId(Integer userId);
}