package com.agentcrm.security;

import com.agentcrm.entity.Agent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedAgentHelper {

    public Agent getAuthenticatedAgent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof Agent agent)) {
            throw new IllegalStateException("No authenticated agent in security context");
        }
        return agent;
    }
}
