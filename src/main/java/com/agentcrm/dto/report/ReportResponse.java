package com.agentcrm.dto.report;

import com.agentcrm.entity.Report;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        UUID agentId,
        String agentName,
        long totalLeads,
        long totalClients,
        long totalInteractions,
        long totalPendingTasks,
        String leadsByStatus,
        LocalDate reportDate,
        LocalDateTime generatedAt) {

    public static ReportResponse fromEntity(Report report) {
        var agent = report.getAgent();
        String agentName = agent.getFirstName() + " " + agent.getLastName();
        return new ReportResponse(
                report.getId(),
                agent.getId(),
                agentName,
                report.getTotalLeads(),
                report.getTotalClients(),
                report.getTotalInteractions(),
                report.getTotalPendingTasks(),
                report.getLeadsByStatus(),
                report.getReportDate(),
                report.getGeneratedAt());
    }
}
