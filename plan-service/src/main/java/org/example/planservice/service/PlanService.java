package org.example.planservice.service;

import org.example.planservice.model.Plan;
import org.example.planservice.repository.PlanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanService {

    @Autowired
    private PlanRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    // ✅ SAVE PLAN
    public Plan savePlan(Plan plan){

        return repo.save(plan);
    }

    // ✅ GET ALL PLANS
    public List<Plan> getAllPlans(){

        return repo.findAll();
    }

    // ✅ GET PLAN BY ID
    public Plan getPlanById(Integer id){

        return repo.findById(id)
                .orElse(null);
    }

    // ✅ DELETE PLAN
    public void deletePlan(Integer id){

        repo.deleteById(id);
    }

    // ✅ UPDATE PLAN
    public Plan updatePlan(
            Integer id,
            Plan updatedPlan
    ){

        Plan existing =
                repo.findById(id)
                        .orElse(null);

        if(existing == null){
            return null;
        }

        // =========================
        // UPDATE PLAN DETAILS
        // =========================

        existing.setPlanName(
                updatedPlan.getPlanName()
        );

        existing.setPrice(
                updatedPlan.getPrice()
        );

        existing.setDataLimit(
                updatedPlan.getDataLimit()
        );

        existing.setCallMinutes(
                updatedPlan.getCallMinutes()
        );

        existing.setSmsLimit(
                updatedPlan.getSmsLimit()
        );

        existing.setValidityDays(
                updatedPlan.getValidityDays()
        );

        existing.setPlanType(
                updatedPlan.getPlanType()
        );

        existing.setNetworkType(
                updatedPlan.getNetworkType()
        );

        Plan savedPlan =
                repo.save(existing);

        // =========================
        // FETCH USERS
        // =========================

        ResponseEntity<List<Map<String, Object>>> response =
                restTemplate.exchange(

                        "http://localhost:8081/users",

                        HttpMethod.GET,

                        null,

                        new ParameterizedTypeReference<
                                List<Map<String, Object>>>() {}
                );

        List<Map<String, Object>> users =
                response.getBody();

        // =========================
        // SEND NOTIFICATIONS
        // =========================

        if(users != null){

            for(Map<String, Object> user : users){

                Object currentPlanObj =
                        user.get("currentPlanId");

                if(currentPlanObj == null){
                    continue;
                }

                Integer currentPlanId =
                        Integer.parseInt(
                                currentPlanObj.toString()
                        );

                if(currentPlanId.equals(id)){

                    Integer userId =
                            Integer.parseInt(
                                    user.get("userId")
                                            .toString()
                            );

                    Map<String, Object> notification =
                            new HashMap<>();

                    notification.put(
                            "userId",
                            userId
                    );

                    notification.put(
                            "title",
                            "Your Plan Is Updated"
                    );

                    notification.put(
                            "message",

                            "Your telecom plan '"
                                    + existing.getPlanName()
                                    + "' has been successfully updated with new benefits, pricing and latest features."
                    );

                    notification.put(
                            "type",
                            "PLAN_UPDATE"
                    );

                    notification.put(
                            "isRead",
                            false
                    );

                    // =========================
                    // CREATE NOTIFICATION
                    // =========================

                    restTemplate.postForObject(

                            "http://localhost:8081/notifications",

                            notification,

                            Object.class
                    );
                }
            }
        }

        return savedPlan;
    }
}