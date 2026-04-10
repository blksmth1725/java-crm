package com.agentcrm.dto.client;

import com.agentcrm.entity.Client;
import java.time.LocalDateTime;
import java.util.UUID;

public record ClientResponse(
        UUID id,
        UUID agentId,
        UUID leadId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String region,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ClientResponse fromEntity(Client client) {
        UUID leadId = client.getLead() != null ? client.getLead().getId() : null;
        return new ClientResponse(
                client.getId(),
                client.getAgent().getId(),
                leadId,
                client.getFirstName(),
                client.getLastName(),
                client.getEmail(),
                client.getPhone(),
                client.getRegion(),
                client.getNotes(),
                client.getCreatedAt(),
                client.getUpdatedAt());
    }
}
