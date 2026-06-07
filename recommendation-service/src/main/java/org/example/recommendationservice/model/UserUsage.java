package org.example.recommendationservice.model;

public class UserUsage {

    private Integer userId;
    private Double dataUsedGb;

    public UserUsage() {}

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
}