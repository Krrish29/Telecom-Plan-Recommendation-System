package org.example.recommendationservice.model;

public class User {

    private Integer userId;

    private String userName;

    private String email;

    private String mobileNumber;

    private String city;

    // ✅ ADD THIS
    private Integer currentPlanId;

    public User() {}

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(
            Integer userId
    ) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(
            String userName
    ) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
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

    public void setCity(
            String city
    ) {
        this.city = city;
    }

    // ✅ CURRENT PLAN ID
    public Integer getCurrentPlanId() {
        return currentPlanId;
    }

    public void setCurrentPlanId(
            Integer currentPlanId
    ) {
        this.currentPlanId = currentPlanId;
    }
}