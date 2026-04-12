package com.agentcrm.scheduler;

import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Report;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.service.ReportService;
import com.agentcrm.service.SlackWebhookService;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NightlyReportJob {

    private static final Logger log = LoggerFactory.getLogger(NightlyReportJob.class);

    private final AgentRepository agentRepository;
    private final ReportService reportService;
    private final SlackWebhookService slackWebhookService;

    @Value("${slack.webhook.url:}")
    private String slackWebhookUrl;

    public NightlyReportJob(
            AgentRepository agentRepository,
            ReportService reportService,
            SlackWebhookService slackWebhookService) {
        this.agentRepository = agentRepository;
        this.reportService = reportService;
        this.slackWebhookService = slackWebhookService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void runNightlyReport() {
        LocalDate reportDate = LocalDate.now(ZoneOffset.UTC);
        var agents = agentRepository.findAll();
        for (Agent agent : agents) {
            Report report = reportService.generateReportForAgent(agent);
            String message =
                    "Nightly Report — "
                            + agent.getFirstName()
                            + " "
                            + agent.getLastName()
                            + "\nLeads: "
                            + report.getTotalLeads()
                            + " | Clients: "
                            + report.getTotalClients()
                            + " | Pending Tasks: "
                            + report.getTotalPendingTasks()
                            + "\nReport date: "
                            + reportDate;
            slackWebhookService.postMessage(slackWebhookUrl, message);
        }
        log.info("Nightly report job completed for {} agents", agents.size());
    }
}
