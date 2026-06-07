package org.example.userservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name")
    private String userName;

    private String email;

    @Column(name = "mobile_number")
    private String mobileNumber;

    private String city;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "current_plan_id")
    private Integer currentPlanId;

    @Transient
    private String currentPlanName;

    @Column(name = "churn_score")
    private Double churnScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "monthly_usage")
    private Double monthlyUsage;

    @Column(name = "recommended_plan")
    private String recommendedPlan;

    public User() {}

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(
            String mobileNumber
    ) {
        this.mobileNumber = mobileNumber;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(
            LocalDate joinDate
    ) {
        this.joinDate = joinDate;
    }

    public Integer getCurrentPlanId() {
        return currentPlanId;
    }

    public void setCurrentPlanId(
            Integer currentPlanId
    ) {
        this.currentPlanId = currentPlanId;
    }

    public String getCurrentPlanName() {
        return currentPlanName;
    }

    public void setCurrentPlanName(
            String currentPlanName
    ) {
        this.currentPlanName = currentPlanName;
    }

    public Double getChurnScore() {
        return churnScore;
    }

    public void setChurnScore(
            Double churnScore
    ) {
        this.churnScore = churnScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(
            String riskLevel
    ) {
        this.riskLevel = riskLevel;
    }

    public Double getMonthlyUsage() {
        return monthlyUsage;
    }

    public void setMonthlyUsage(
            Double monthlyUsage
    ) {
        this.monthlyUsage = monthlyUsage;
    }

    public String getRecommendedPlan() {
        return recommendedPlan;
    }

    public void setRecommendedPlan(
            String recommendedPlan
    ) {
        this.recommendedPlan = recommendedPlan;
    }
}