package org.example.userservice.controller;

import org.example.userservice.model.User;
import org.example.userservice.model.UserUsage;
import org.example.userservice.model.ChurnAnalysis;
import org.example.userservice.model.Plan;

import org.example.userservice.service.UserService;

import org.example.userservice.repository.UserUsageRepository;
import org.example.userservice.repository.ChurnAnalysisRepository;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private UserUsageRepository usageRepo;

    @Autowired
    private ChurnAnalysisRepository churnRepo;

    // ✅ CREATE USER
    @PostMapping
    public User createUser(
            @RequestBody User user
    ) {

        return service.saveUser(user);
    }

    // ✅ GET USER BY ID
    @GetMapping("/{id}")
    public User getUser(
            @PathVariable Integer id
    ) {

        return service.getUser(id);
    }

    // ✅ GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {

        return service.getAllUsers();
    }

    // ✅ ADMIN AI ANALYTICS DATA
    @GetMapping("/analytics")
    public List<User> getAnalyticsUsers() {

        return service.getAllUsers();
    }

    // ✅ GET USER BY MOBILE NUMBER
    @GetMapping("/mobile/{mobile}")
    public User getUserByMobile(
            @PathVariable String mobile
    ) {

        return service.getUserByMobile(mobile);
    }

    // ✅ UPDATE CURRENT PLAN
    @PutMapping("/{userId}/plan/{planId}")
    public User updateCurrentPlan(
            @PathVariable Integer userId,
            @PathVariable Integer planId
    ){

        return service.updateCurrentPlan(
                userId,
                planId
        );
    }

    // ✅ GET CURRENT PLAN USING MOBILE NUMBER
    @GetMapping("/current-plan/{mobile}")
    public Plan getCurrentPlan(
            @PathVariable String mobile
    ) {

        return service.getCurrentPlan(mobile);
    }

    // ✅ GET USAGE
    @GetMapping("/usage/{id}")
    public UserUsage getUsage(
            @PathVariable Integer id
    ) {

        return usageRepo.findByUserId(id);
    }

    // ✅ GET CHURN
    @GetMapping("/churn/{id}")
    public ChurnAnalysis getChurn(
            @PathVariable Integer id
    ) {

        return churnRepo.findByUserId(id);
    }
}