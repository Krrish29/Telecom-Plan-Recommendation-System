package org.example.planservice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "mobile_plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "plan_id")
    private Integer planId;

    @Column(name = "plan_name")
    private String planName;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "data_limit")
    private String dataLimit;

    @Column(name = "call_minutes")
    private String callMinutes;

    @Column(name = "sms_limit")
    private String smsLimit;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(name = "plan_type")
    private String planType;

    @Column(name = "network_type")
    private String networkType;

    public Plan() {}

    // ✅ GETTERS & SETTERS

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