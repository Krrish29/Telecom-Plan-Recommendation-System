package org.example.userservice.model;

import java.math.BigDecimal;

public class Plan {

    private Integer planId;

    private String planName;

    private BigDecimal price;

    private String dataLimit;

    private String callMinutes;

    private String smsLimit;

    private Integer validityDays;

    private String planType;

    private String networkType;

    public Plan() {}

    public Integer getPlanId() {
        return planId;
    }

    public void setPlanId(Integer planId) {
        this.planId = planId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDataLimit() {
        return dataLimit;
    }

    public void setDataLimit(String dataLimit) {
        this.dataLimit = dataLimit;
    }

    public String getCallMinutes() {
        return callMinutes;
    }

    public void setCallMinutes(String callMinutes) {
        this.callMinutes = callMinutes;
    }

    public String getSmsLimit() {
        return smsLimit;
    }

    public void setSmsLimit(String smsLimit) {
        this.smsLimit = smsLimit;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public String getNetworkType() {
        return networkType;
    }

    public void setNetworkType(String networkType) {
        this.networkType = networkType;
    }
}