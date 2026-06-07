package org.example.recommendationservice.controller;

import org.example.recommendationservice.model.Recommendation;
import org.example.recommendationservice.service.RecommendationService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/recommend")
public class RecommendationController {

    @Autowired
    private RecommendationService service;

    // ✅ OLD USER ID API
    @GetMapping("/{userId}")
    public List<Recommendation> getRecommendation(
            @PathVariable Integer userId
    ) {

        return service.generateRecommendation(userId);
    }

    // ✅ NEW MOBILE NUMBER API
    @GetMapping("/mobile/{mobile}")
    public List<Recommendation> getRecommendationByMobile(
            @PathVariable String mobile
    ) {

        return service.generateRecommendationByMobile(mobile);
    }
}