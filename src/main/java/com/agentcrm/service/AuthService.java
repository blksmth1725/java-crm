package com.agentcrm.service;

import com.agentcrm.dto.auth.AuthResponse;
import com.agentcrm.dto.auth.LoginRequest;
import com.agentcrm.dto.auth.RegisterRequest;
import com.agentcrm.entity.Agent;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AgentRepository agentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (agentRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        Agent agent = new Agent();
        agent.setEmail(email);
        agent.setPasswordHash(passwordEncoder.encode(request.password()));
        agent.setFirstName(request.firstName().trim());
        agent.setLastName(request.lastName().trim());
        agent.setRegion(request.region().trim());
        agent.setRole(request.role());
        Agent saved = agentRepository.save(agent);
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Agent agent = agentRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), agent.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return buildAuthResponse(agent);
    }

    private AuthResponse buildAuthResponse(Agent agent) {
        String token = jwtUtil.generateToken(agent);
        return new AuthResponse(token, agent.getId(), agent.getEmail(), agent.getFirstName(), agent.getRole());
    }
}
