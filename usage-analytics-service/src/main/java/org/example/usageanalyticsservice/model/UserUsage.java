package org.example.usageanalyticsservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_usage")
public class UserUsage {

    @Id
    @Column(name = "usage_id")
    private Integer usageId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "data_used_gb")
    private Double dataUsedGb;

    @Column(name = "call_minutes_used")
    private Integer callMinutesUsed;

    @Column(name = "sms_used")
    private Integer smsUsed;

    @Column(name = "last_active")
    private LocalDate lastActive;

    @Column(name = "complaints")
    private Integer complaints;

    @Column(name = "usage_month")
    private LocalDate usageMonth;

    // ── Getters & Setters ──────────────────────────────────────

    public Integer getUsageId() { return usageId; }
    public void setUsageId(Integer usageId) { this.usageId = usageId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Double getDataUsedGb() { return dataUsedGb; }
    public void setDataUsedGb(Double dataUsedGb) { this.dataUsedGb = dataUsedGb; }

    public Integer getCallMinutesUsed() { return callMinutesUsed; }
    public void setCallMinutesUsed(Integer callMinutesUsed) { this.callMinutesUsed = callMinutesUsed; }

    public Integer getSmsUsed() { return smsUsed; }
    public void setSmsUsed(Integer smsUsed) { this.smsUsed = smsUsed; }

    public LocalDate getLastActive() { return lastActive; }
    public void setLastActive(LocalDate lastActive) { this.lastActive = lastActive; }

    public Integer getComplaints() { return complaints; }
    public void setComplaints(Integer complaints) { this.complaints = complaints; }

    public LocalDate getUsageMonth() { return usageMonth; }
    public void setUsageMonth(LocalDate usageMonth) { this.usageMonth = usageMonth; }
}