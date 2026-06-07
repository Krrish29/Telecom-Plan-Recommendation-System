package org.example.recommendationservice.model;

public class Recommendation {

    private Integer recId;
    private Integer userId;
    private Integer recommendedPlanId;
    private String reason;

    // PLAN DETAILS
    private String planName;
    private Double matchScore;
    private Double price;
    private String dataLimit;
    private Integer validityDays;
    private String networkType;

    // ✅ ADDED
    private String callMinutes;
    private String smsLimit;
    private String planType;

    public Recommendation() {}

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Integer getRecId() {
        return recId;
    }

    public void setRecId(
            Integer recId
    ) {
        this.recId = recId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(
            Integer userId
    ) {
        this.userId = userId;
    }

    public Integer getRecommendedPlanId() {
        return recommendedPlanId;
    }

    public void setRecommendedPlanId(
            Integer recommendedPlanId
    ) {
        this.recommendedPlanId =
                recommendedPlanId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(
            String planName
    ) {
        this.planName = planName;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(
            Double matchScore
    ) {
        this.matchScore = matchScore;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(
            Double price
    ) {
        this.price = price;
    }

    public String getDataLimit() {
        return dataLimit;
    }

    public void setDataLimit(
            String dataLimit
    ) {
        this.dataLimit = dataLimit;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(
            Integer validityDays
    ) {
        this.validityDays =
                validityDays;
    }

    public String getNetworkType() {
        return networkType;
    }

    public void setNetworkType(
            String networkType
    ) {
        this.networkType =
                networkType;
    }

    // ✅ CALL MINUTES

    public String getCallMinutes() {
        return callMinutes;
    }

    public void setCallMinutes(
            String callMinutes
    ) {
        this.callMinutes =
                callMinutes;
    }

    // ✅ SMS LIMIT

    public String getSmsLimit() {
        return smsLimit;
    }

    public void setSmsLimit(
            String smsLimit
    ) {
        this.smsLimit =
                smsLimit;
    }

    // ✅ PLAN TYPE

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(
            String planType
    ) {
        this.planType =
                planType;
    }
}