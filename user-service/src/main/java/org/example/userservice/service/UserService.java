package org.example.userservice.service;

import org.example.userservice.model.Plan;
import org.example.userservice.model.User;

import org.example.userservice.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    // ✅ SAVE USER
    public User saveUser(User user){

        return repo.save(user);
    }

    // ✅ GET USER BY ID
    public User getUser(Integer userId){

        User user = repo.findById(userId)
                .orElse(null);

        if(user != null){

            loadCurrentPlanName(user);
        }

        return user;
    }

    // ✅ GET ALL USERS
    public List<User> getAllUsers(){

        List<User> users = repo.findAll();

        for(User user : users){

            loadCurrentPlanName(user);
        }

        return users;
    }

    // ✅ GET USER BY MOBILE NUMBER
    public User getUserByMobile(String mobileNumber){

        User user =
                repo.findByMobileNumber(
                        mobileNumber
                );

        if(user != null){

            loadCurrentPlanName(user);
        }

        return user;
    }

    // ✅ GET CURRENT PLAN BY MOBILE
    public Plan getCurrentPlan(String mobile){

        User user =
                repo.findByMobileNumber(mobile);

        if(user == null){

            throw new RuntimeException(
                    "User not found"
            );
        }

        Integer currentPlanId =
                user.getCurrentPlanId();

        if(currentPlanId == null){

            throw new RuntimeException(
                    "No current plan assigned"
            );
        }

        return restTemplate.getForObject(
                "http://PLAN-SERVICE/plans/"
                        + currentPlanId,
                Plan.class
        );
    }

    // ✅ UPDATE CURRENT PLAN
    public User updateCurrentPlan(
            Integer userId,
            Integer newPlanId
    ){

        User user = repo.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        user.setCurrentPlanId(newPlanId);

        User updatedUser =
                repo.save(user);

        loadCurrentPlanName(updatedUser);

        return updatedUser;
    }

    // ✅ LOAD CURRENT PLAN NAME
    private void loadCurrentPlanName(User user){

        try {

            if(user.getCurrentPlanId() != null){

                Plan plan =
                        restTemplate.getForObject(
                                "http://PLAN-SERVICE/plans/"
                                        + user.getCurrentPlanId(),
                                Plan.class
                        );

                if(plan != null){

                    user.setCurrentPlanName(
                            plan.getPlanName()
                    );
                }
            }

        } catch (Exception e){

            user.setCurrentPlanName(
                    "No Plan"
            );
        }
    }
}