package com.agentcrm.dto.interaction;

import com.agentcrm.entity.Interaction;
import com.agentcrm.entity.InteractionType;
import java.time.LocalDateTime;
import java.util.UUID;

public record InteractionResponse(
        UUID id,
        UUID agentId,
        UUID leadId,
        UUID clientId,
        InteractionType type,
        String summary,
        LocalDateTime occurredAt,
        LocalDateTime createdAt) {

    public static InteractionResponse fromEntity(Interaction interaction) {
        UUID leadId = interaction.getLead() != null ? interaction.getLead().getId() : null;
        UUID clientId = interaction.getClient() != null ? interaction.getClient().getId() : null;
        return new InteractionResponse(
                interaction.getId(),
                interaction.getAgent().getId(),
                leadId,
                clientId,
                interaction.getType(),
                interaction.getSummary(),
                interaction.getOccurredAt(),
                interaction.getCreatedAt());
    }
}
