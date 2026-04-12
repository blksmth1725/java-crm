package com.agentcrm.dto.stats;

import com.agentcrm.entity.LeadStatus;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record PipelineStatsResponse(
        UUID agentId,
        String agentName,
        long totalLeads,
        Map<LeadStatus, Long> leadsByStatus,
        long totalClients,
        long totalInteractions,
        long totalPendingTasks,
        LocalDateTime generatedAt) {}
