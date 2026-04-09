package com.agentcrm.dto.agent;

import com.agentcrm.entity.Agent;
import com.agentcrm.entity.AgentRole;
import java.time.Instant;
import java.util.UUID;

public record AgentResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String region,
        AgentRole role,
        Instant createdAt,
        Instant updatedAt) {

    public static AgentResponse fromEntity(Agent agent) {
        return new AgentResponse(
                agent.getId(),
                agent.getEmail(),
                agent.getFirstName(),
                agent.getLastName(),
                agent.getRegion(),
                agent.getRole(),
                agent.getCreatedAt(),
                agent.getUpdatedAt());
    }
}
