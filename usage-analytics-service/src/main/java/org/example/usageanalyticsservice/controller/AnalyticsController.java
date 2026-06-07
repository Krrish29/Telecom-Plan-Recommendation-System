package org.example.usageanalyticsservice.controller;

import org.example.usageanalyticsservice.model.UserUsage;
import org.example.usageanalyticsservice.service.AnalyticsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@CrossOrigin("*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService service;

    // ✅ AVERAGE DATA USAGE
    @GetMapping("/average/{userId}")
    public double getAverage(
            @PathVariable Integer userId
    ){
        return service.getAverageUsage(userId);
    }

    // ✅ AVERAGE CALL MINUTES
    @GetMapping("/calls/{userId}")
    public double getCallMinutes(
            @PathVariable Integer userId
    ){
        return service.getAverageCallMinutes(userId);
    }

    // ✅ AVERAGE SMS USED
    @GetMapping("/sms/{userId}")
    public double getSmsUsed(
            @PathVariable Integer userId
    ){
        return service.getAverageSmsUsed(userId);
    }

    // ✅ TOTAL COMPLAINTS
    @GetMapping("/complaints/{userId}")
    public int getComplaints(
            @PathVariable Integer userId
    ){
        return service.getTotalComplaints(userId);
    }

    // ✅ HISTORY
    @GetMapping("/history/{userId}")
    public List<UserUsage> getHistory(
            @PathVariable Integer userId
    ){
        return service.getUsageHistory(userId);
    }
}