package org.example.userservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "churn_analysis")
public class ChurnAnalysis {

    @Id
    @Column(name = "churn_id")
    private Integer churnId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "churn_score")
    private Double churnScore;

    @Column(name = "churn_risk_label")
    private String churnRiskLabel;

    @Column(name = "churn")
    private Boolean churn;

    public ChurnAnalysis() {}

    // GETTERS & SETTERS

    public Integer getChurnId() {
        return churnId;
    }

    public void setChurnId(Integer churnId) {
        this.churnId = churnId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Double getChurnScore() {
        return churnScore;
    }

    public void setChurnScore(Double churnScore) {
        this.churnScore = churnScore;
    }

    public String getChurnRiskLabel() {
        return churnRiskLabel;
    }

    public void setChurnRiskLabel(String churnRiskLabel) {
        this.churnRiskLabel = churnRiskLabel;
    }

    public Boolean getChurn() {
        return churn;
    }

    public void setChurn(Boolean churn) {
        this.churn = churn;
    }
}