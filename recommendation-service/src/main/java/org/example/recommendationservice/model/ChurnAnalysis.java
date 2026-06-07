package org.example.recommendationservice.model;

public class ChurnAnalysis {

    private Integer userId;
    private Double churnScore;

    public ChurnAnalysis() {
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
}