package com.agentcrm.service;

import com.agentcrm.dto.agent.AgentResponse;
import com.agentcrm.dto.agent.CreateAgentRequest;
import com.agentcrm.dto.agent.UpdateAgentRequest;
import com.agentcrm.entity.Agent;
import com.agentcrm.repository.AgentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AgentService {

    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;

    public AgentService(AgentRepository agentRepository, PasswordEncoder passwordEncoder) {
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> findAll() {
        return agentRepository.findAll().stream().map(AgentResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public AgentResponse findById(UUID id) {
        return agentRepository
                .findById(id)
                .map(AgentResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
    }

    @Transactional
    public AgentResponse create(CreateAgentRequest request) {
        if (agentRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        Agent agent = new Agent();
        agent.setEmail(request.email().trim().toLowerCase());
        agent.setPasswordHash(passwordEncoder.encode(request.password()));
        agent.setFirstName(request.firstName().trim());
        agent.setLastName(request.lastName().trim());
        agent.setRegion(request.region().trim());
        agent.setRole(request.role());
        Agent saved = agentRepository.save(agent);
        return AgentResponse.fromEntity(saved);
    }

    @Transactional
    public AgentResponse update(UUID id, UpdateAgentRequest request) {
        Agent agent = agentRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        if (agentRepository.existsByEmailIgnoreCaseAndIdNot(request.email().trim().toLowerCase(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        agent.setEmail(request.email().trim().toLowerCase());
        agent.setFirstName(request.firstName().trim());
        agent.setLastName(request.lastName().trim());
        agent.setRegion(request.region().trim());
        agent.setRole(request.role());
        return AgentResponse.fromEntity(agent);
    }

    @Transactional
    public void deleteById(UUID id) {
        if (!agentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
        }
        agentRepository.deleteById(id);
    }
}
