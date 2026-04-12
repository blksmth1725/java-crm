package com.agentcrm.controller;

import com.agentcrm.dto.report.ReportResponse;
import com.agentcrm.security.AuthenticatedAgentHelper;
import com.agentcrm.scheduler.NightlyReportJob;
import com.agentcrm.service.ReportService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AuthenticatedAgentHelper authenticatedAgentHelper;
    private final NightlyReportJob nightlyReportJob;

    public ReportController(
            ReportService reportService,
            AuthenticatedAgentHelper authenticatedAgentHelper,
            NightlyReportJob nightlyReportJob) {
        this.reportService = reportService;
        this.authenticatedAgentHelper = authenticatedAgentHelper;
        this.nightlyReportJob = nightlyReportJob;
    }

    @GetMapping("/me")
    public List<ReportResponse> myReports() {
        return reportService.getReportsForAgent(authenticatedAgentHelper.getAuthenticatedAgent().getId());
    }

    @GetMapping("/me/today")
    public ReportResponse myReportToday() {
        return reportService.getTodayReportForAgent(authenticatedAgentHelper.getAuthenticatedAgent().getId());
    }

    @PostMapping("/trigger")
    public ResponseEntity<String> trigger() {
        nightlyReportJob.runNightlyReport();
        return ResponseEntity.ok("Report job triggered");
    }
}
