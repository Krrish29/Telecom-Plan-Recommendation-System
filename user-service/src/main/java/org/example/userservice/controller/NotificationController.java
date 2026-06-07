package org.example.userservice.controller;

import org.example.userservice.model.Notification;

import org.example.userservice.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationRepository repo;

    // =========================
    // GET USER NOTIFICATIONS
    // =========================

    @GetMapping("/user/{userId}")
    public List<Notification> getNotifications(
            @PathVariable Integer userId
    ) {

        return repo
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    // =========================
    // CREATE NOTIFICATION
    // =========================

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification
    ) {

        return repo.save(notification);
    }
}