package com.agentcrm.dto.auth;

import com.agentcrm.entity.AgentRole;
import java.util.UUID;

public record AuthResponse(
        String token, UUID agentId, String email, String firstName, AgentRole role) {}
