package org.example.planservice.controller;

import org.example.planservice.model.Plan;
import org.example.planservice.service.PlanService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/plans")
public class PlanController {

    @Autowired
    private PlanService service;

    // ✅ ADD PLAN
    @PostMapping
    public Plan addPlan(
            @RequestBody Plan plan
    ){

        return service.savePlan(plan);
    }

    // ✅ GET ALL PLANS
    @GetMapping
    public List<Plan> getPlans(){

        return service.getAllPlans();
    }

    // ✅ GET PLAN BY ID
    @GetMapping("/{id}")
    public Plan getPlanById(
            @PathVariable Integer id
    ){

        return service.getPlanById(id);
    }

    // ✅ DELETE PLAN
    @DeleteMapping("/{id}")
    public void deletePlan(
            @PathVariable Integer id
    ){

        service.deletePlan(id);
    }

    // ✅ UPDATE PLAN
    @PutMapping("/{id}")
    public Plan updatePlan(
            @PathVariable Integer id,
            @RequestBody Plan plan
    ){

        return service.updatePlan(id, plan);
    }
}