package org.example.recommendationservice.service;

import org.example.recommendationservice.model.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class RecommendationService {

    @Autowired
    private RestTemplate restTemplate;

    // =====================================================
    // USER ID BASED RECOMMENDATION
    // =====================================================

    public List<Recommendation> generateRecommendation(
            Integer userId
    ) {

        // USER SERVICE
        User user = restTemplate.getForObject(
                "http://USER-SERVICE/users/" + userId,
                User.class
        );

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // USAGE
        UserUsage usage = restTemplate.getForObject(
                "http://USER-SERVICE/users/usage/" + userId,
                UserUsage.class
        );

        // ANALYTICS — updated to new endpoints (trend removed)
        Double avgUsage = restTemplate.getForObject(
                "http://USAGE-ANALYTICS-SERVICE/analytics/average/" + userId,
                Double.class
        );

        Double avgCallMinutes = restTemplate.getForObject(
                "http://USAGE-ANALYTICS-SERVICE/analytics/calls/" + userId,
                Double.class
        );

        Double avgSmsUsed = restTemplate.getForObject(
                "http://USAGE-ANALYTICS-SERVICE/analytics/sms/" + userId,
                Double.class
        );

        Integer totalComplaints = restTemplate.getForObject(
                "http://USAGE-ANALYTICS-SERVICE/analytics/complaints/" + userId,
                Integer.class
        );

        // PLAN SERVICE
        Plan[] plansArray = restTemplate.getForObject(
                "http://PLAN-SERVICE/plans",
                Plan[].class
        );

        List<Plan> plans = Arrays.stream(plansArray)
                .filter(p -> !p.getPlanId().equals(user.getCurrentPlanId()))
                .collect(Collectors.toList());

        if (plans.isEmpty()) {
            throw new RuntimeException("No plans available");
        }

        List<Recommendation> recommendations = new ArrayList<>();

        for (Plan p : plans) {

            double score = 0;

            int planData = extractDataLimit(p.getDataLimit());

            // DATA USAGE MATCHING
            if (avgUsage != null && avgUsage > 0) {
                double ratio = planData / avgUsage;
                if (ratio >= 1 && ratio <= 1.3) {
                    score += 90;
                } else if (ratio > 1.3 && ratio <= 2) {
                    score += 60;
                } else if (ratio < 1) {
                    score += 5;
                } else {
                    score += 20;
                }
            }

            // PRICE IMPACT
            if (p.getPrice() != null) {
                double price = p.getPrice().doubleValue();
                score += (1000 - price) / 200;
            }

            // COMPLAINTS PENALTY — penalise plans if user has complaints
            if (totalComplaints != null && totalComplaints > 0) {
                score -= totalComplaints * 2;
            }

            // CALL MINUTES BONUS — reward plans with more call minutes
            // if the user is a heavy caller
            if (avgCallMinutes != null && p.getCallMinutes() != null) {
                try {
                    int planCalls = Integer.parseInt(
                            p.getCallMinutes().replaceAll("[^0-9]", "")
                    );
                    if (avgCallMinutes > 500 && planCalls > 500) score += 5;
                } catch (Exception ignored) {}
            }

            // SMS BONUS — reward plans with more SMS if user is a heavy SMS user
            if (avgSmsUsed != null && p.getSmsLimit() != null) {
                try {
                    int planSms = Integer.parseInt(
                            p.getSmsLimit().replaceAll("[^0-9]", "")
                    );
                    if (avgSmsUsed > 100 && planSms > 100) score += 3;
                } catch (Exception ignored) {}
            }

            // CREATE RECOMMENDATION
            Recommendation rec = new Recommendation();

            rec.setUserId(userId);
            rec.setRecommendedPlanId(p.getPlanId());
            rec.setPlanName(p.getPlanName());
            rec.setPrice(p.getPrice().doubleValue());
            rec.setDataLimit(p.getDataLimit());
            rec.setValidityDays(p.getValidityDays());
            rec.setNetworkType(p.getNetworkType());
            rec.setCallMinutes(p.getCallMinutes());
            rec.setSmsLimit(p.getSmsLimit());
            rec.setPlanType(p.getPlanType());
            rec.setMatchScore(score / 100.0);
            rec.setReason(buildReason(p, avgUsage, avgCallMinutes, avgSmsUsed, totalComplaints));

            recommendations.add(rec);
        }

        // SORT BEST FIRST
        recommendations.sort(
                Comparator.comparingDouble(Recommendation::getMatchScore).reversed()
        );

        return recommendations.subList(0, Math.min(3, recommendations.size()));
    }

    // =====================================================
    // MOBILE NUMBER BASED RECOMMENDATION
    // =====================================================

    public List<Recommendation> generateRecommendationByMobile(String mobile) {

        User user = restTemplate.getForObject(
                "http://USER-SERVICE/users/mobile/" + mobile,
                User.class
        );

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return generateRecommendation(user.getUserId());
    }

    // =====================================================
    // DATA LIMIT PARSER
    // =====================================================

    private int extractDataLimit(String dataLimit) {
        try {
            int daily = Integer.parseInt(dataLimit.replaceAll("[^0-9]", ""));
            return daily * 30;
        } catch (Exception e) {
            return 1;
        }
    }

    // =====================================================
    // REASON BUILDER
    // =====================================================

    private String buildReason(
            Plan p,
            Double avgUsage,
            Double avgCallMinutes,
            Double avgSmsUsed,
            Integer totalComplaints
    ) {
        StringBuilder reason = new StringBuilder();

        if (avgUsage != null) {
            reason.append("Avg data: ").append(String.format("%.1f", avgUsage)).append(" GB. ");
        }
        if (avgCallMinutes != null) {
            reason.append("Avg calls: ").append(Math.round(avgCallMinutes)).append(" min. ");
        }
        if (avgSmsUsed != null) {
            reason.append("Avg SMS: ").append(Math.round(avgSmsUsed)).append(". ");
        }
        if (totalComplaints != null && totalComplaints > 0) {
            reason.append("Complaints: ").append(totalComplaints).append(". ");
        }
        if (p.getPrice() != null) {
            reason.append("Price ₹").append(p.getPrice()).append(". ");
        }

        return reason.toString();
    }
}