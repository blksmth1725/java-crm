package com.agentcrm.controller;

import com.agentcrm.dto.stats.PipelineStatsResponse;
import com.agentcrm.security.AuthenticatedAgentHelper;
import com.agentcrm.service.StatsService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;
    private final AuthenticatedAgentHelper authenticatedAgentHelper;

    public StatsController(StatsService statsService, AuthenticatedAgentHelper authenticatedAgentHelper) {
        this.statsService = statsService;
        this.authenticatedAgentHelper = authenticatedAgentHelper;
    }

    @GetMapping("/me")
    public PipelineStatsResponse me() {
        return statsService.getPipelineStats(authenticatedAgentHelper.getAuthenticatedAgent().getId());
    }

    @GetMapping("/agent/{agentId}")
    public PipelineStatsResponse byAgent(@PathVariable UUID agentId) {
        return statsService.getPipelineStats(agentId);
    }
}
