package com.farmxchain.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "mysecretkeymysecretkeymysecretkey123"; // must be >=32 chars
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours
    private static final String ROLE_CLAIM = "role";

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Generate token with email + role
    public String generateToken(Long farmerId, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("farmerId", farmerId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long extractFarmerId(String token) {
        Claims claims = extractClaims(token);
        return claims.get("farmerId", Long.class);
    }


    // Extract email (subject) from token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract role from token
    public String extractRole(String token) {
        return extractClaims(token).get(ROLE_CLAIM, String.class);
    }

    // Validate token with email
    public boolean validateToken(String token, String email) {
        try {
            return (email.equals(extractEmail(token)) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false; // invalid token
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                       .setSigningKey(key)
                       .build()
                       .parseClaimsJws(token)
                       .getBody();
        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }

	public String generateToken1(Long farmerId, String email, String role) {
		// TODO Auto-generated method stub
		return null;
	}
}
