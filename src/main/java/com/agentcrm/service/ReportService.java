package com.agentcrm.service;

import com.agentcrm.dto.report.ReportResponse;
import com.agentcrm.dto.stats.PipelineStatsResponse;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Report;
import com.agentcrm.repository.ReportRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final StatsService statsService;
    private final ObjectMapper objectMapper;

    public ReportService(
            ReportRepository reportRepository, StatsService statsService, ObjectMapper objectMapper) {
        this.reportRepository = reportRepository;
        this.statsService = statsService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Report generateReportForAgent(Agent agent) {
        LocalDate reportDate = LocalDate.now(ZoneOffset.UTC);
        return reportRepository
                .findByAgent_IdAndReportDate(agent.getId(), reportDate)
                .orElseGet(() -> persistNewReport(agent, reportDate));
    }

    private Report persistNewReport(Agent agent, LocalDate reportDate) {
        PipelineStatsResponse stats = statsService.getPipelineStats(agent.getId());
        Map<String, Long> leadsJson = new LinkedHashMap<>();
        stats.leadsByStatus().forEach((status, count) -> leadsJson.put(status.name(), count));
        String leadsByStatusJson;
        try {
            leadsByStatusJson = objectMapper.writeValueAsString(leadsJson);
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to serialize leadsByStatus", e);
        }

        Report report = new Report();
        report.setAgent(agent);
        report.setTotalLeads(stats.totalLeads());
        report.setTotalClients(stats.totalClients());
        report.setTotalInteractions(stats.totalInteractions());
        report.setTotalPendingTasks(stats.totalPendingTasks());
        report.setLeadsByStatus(leadsByStatusJson);
        report.setReportDate(reportDate);
        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsForAgent(UUID agentId) {
        return reportRepository.findByAgent_IdOrderByReportDateDesc(agentId).stream()
                .map(ReportResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportResponse getTodayReportForAgent(UUID agentId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Report report =
                reportRepository
                        .findByAgent_IdAndReportDate(agentId, today)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No report for today"));
        return ReportResponse.fromEntity(report);
    }
}
