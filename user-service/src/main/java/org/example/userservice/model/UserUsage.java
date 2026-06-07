package org.example.userservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_usage") // 🔥 FIX TABLE NAME ALSO
public class UserUsage {

    @Id
    @Column(name = "usage_id")
    private Integer usageId;

    @Column(name = "user_id")
    private Integer userId; // ✅ FIXED

    private Double dataUsedGb;
    private Integer callMinutesUsed;
    private Integer smsUsed;

    private LocalDate lastActive;
    private Integer complaints;

    public UserUsage() {}

    public Integer getUsageId() {
        return usageId;
    }

    public void setUsageId(Integer usageId) {
        this.usageId = usageId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Double getDataUsedGb() {
        return dataUsedGb;
    }

    public void setDataUsedGb(Double dataUsedGb) {
        this.dataUsedGb = dataUsedGb;
    }

    public Integer getCallMinutesUsed() {
        return callMinutesUsed;
    }

    public void setCallMinutesUsed(Integer callMinutesUsed) {
        this.callMinutesUsed = callMinutesUsed;
    }

    public Integer getSmsUsed() {
        return smsUsed;
    }

    public void setSmsUsed(Integer smsUsed) {
        this.smsUsed = smsUsed;
    }

    public LocalDate getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDate lastActive) {
        this.lastActive = lastActive;
    }

    public Integer getComplaints() {
        return complaints;
    }

    public void setComplaints(Integer complaints) {
        this.complaints = complaints;
    }
}