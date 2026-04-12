package com.agentcrm.service;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class SlackWebhookService {

    private static final Logger log = LoggerFactory.getLogger(SlackWebhookService.class);

    private final RestTemplate restTemplate;

    public SlackWebhookService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void postMessage(String webhookUrl, String message) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.warn("Slack webhook URL is not configured; skipping notification");
            return;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> body = Map.of("text", message);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        try {
            restTemplate.postForEntity(webhookUrl, entity, String.class);
        } catch (RestClientException e) {
            log.error("Slack webhook request failed: {}", e.getMessage());
        }
    }
}
