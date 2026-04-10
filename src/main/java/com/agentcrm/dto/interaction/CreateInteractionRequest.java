package com.agentcrm.dto.interaction;

import com.agentcrm.entity.InteractionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record CreateInteractionRequest(
        @NotNull UUID agentId,
        UUID leadId,
        UUID clientId,
        @NotNull InteractionType type,
        @NotBlank String summary,
        @NotNull LocalDateTime occurredAt) {}
