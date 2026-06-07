package org.example.recommendationservice.model;

public class Plan {

    private Integer planId;
    private String planName;
    private Double price;
    private String dataLimit;
    private Integer validityDays;

    private String networkType;

    // ✅ ADDED
    private String callMinutes;
    private String smsLimit;
    private String planType;

    public Plan() {}

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Integer getPlanId() {
        return planId;
    }

    public void setPlanId(
            Integer planId
    ) {
        this.planId = planId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(
            String planName
    ) {
        this.planName = planName;
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
        this.validityDays = validityDays;
    }

    public String getNetworkType() {
        return networkType;
    }

    public void setNetworkType(
            String networkType
    ) {
        this.networkType = networkType;
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