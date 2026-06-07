package org.example.userservice.repository;

import org.example.userservice.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository
        extends JpaRepository<User, Integer> {

    // ✅ FIND USER BY MOBILE NUMBER
    User findByMobileNumber(
            String mobileNumber
    );

    // ✅ FIND USERS BY PLAN ID
    List<User> findByCurrentPlanId(
            Integer currentPlanId
    );
}