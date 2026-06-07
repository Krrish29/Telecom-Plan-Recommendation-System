package org.example.authservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key key;

    // =====================================================
    // 🔥 INITIALIZE SECRET KEY
    // =====================================================

    @PostConstruct
    public void init() {

        key = Keys.hmacShaKeyFor(
                secretKey.getBytes()
        );
    }

    // =====================================================
    // 🔥 GENERATE TOKEN
    // =====================================================

    public String generateToken(
            String username,
            String role
    ) {

        return Jwts.builder()

                .setSubject(username)

                .claim("role", role)

                .setIssuedAt(new Date())

                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpiration
                        )
                )

                .signWith(
                        key,
                        SignatureAlgorithm.HS256
                )

                .compact();
    }

    // =====================================================
    // 🔥 EXTRACT USERNAME
    // =====================================================

    public String extractUsername(
            String token
    ) {

        return extractClaims(token)
                .getSubject();
    }

    // =====================================================
    // 🔥 EXTRACT ROLE
    // =====================================================

    public String extractRole(
            String token
    ) {

        return extractClaims(token)
                .get(
                        "role",
                        String.class
                );
    }

    // =====================================================
    // 🔥 VALIDATE TOKEN
    // =====================================================

    public boolean validateToken(
            String token
    ) {

        try {

            extractClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    // =====================================================
    // 🔥 EXTRACT CLAIMS
    // =====================================================

    private Claims extractClaims(
            String token
    ) {

        return Jwts.parserBuilder()

                .setSigningKey(key)

                .build()

                .parseClaimsJws(token)

                .getBody();
    }
}