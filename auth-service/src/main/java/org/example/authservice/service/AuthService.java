package org.example.authservice.service;

import org.example.authservice.dto.LoginRequest;
import org.example.authservice.dto.LoginResponse;
import org.example.authservice.dto.RegisterRequest;

import org.example.authservice.model.AuthUser;

import org.example.authservice.repository.AuthUserRepository;

import org.example.authservice.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthUserRepository repository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔥 REGISTER
    public String register(RegisterRequest request) {

        // CHECK EXISTING USER
        if(repository.findByUsername(
                request.getUsername()
        ).isPresent()) {

            return "Username already exists";
        }

        AuthUser user = new AuthUser();

        user.setUsername(request.getUsername());

        // 🔥 ENCRYPT PASSWORD
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(request.getRole());

        repository.save(user);

        return "User registered successfully";
    }

    // 🔥 LOGIN
    public LoginResponse login(LoginRequest request) {

        AuthUser user = repository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // PASSWORD CHECK
        if(!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException("Invalid password");
        }

        // JWT TOKEN
        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole()
        );

        Integer telecomUserId = 0;

        if(user.getUsername().equalsIgnoreCase("ravi")){

            telecomUserId = 1;
        }

        else if(user.getUsername().equalsIgnoreCase("anjali")){

            telecomUserId = 2;
        }

        else if(user.getUsername().equalsIgnoreCase("vikram")){

            telecomUserId = 3;
        }

        else if(user.getUsername().equalsIgnoreCase("krrish")){

            telecomUserId = 17;
        }

        return new LoginResponse(

                token,

                user.getRole(),

                telecomUserId,

                user.getUsername()
        );
    }
}