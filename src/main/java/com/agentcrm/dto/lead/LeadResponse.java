package com.agentcrm.dto.lead;

import com.agentcrm.entity.Lead;
import com.agentcrm.entity.LeadStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record LeadResponse(
        UUID id,
        UUID agentId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String region,
        LeadStatus status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static LeadResponse fromEntity(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getAgent().getId(),
                lead.getFirstName(),
                lead.getLastName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getRegion(),
                lead.getStatus(),
                lead.getNotes(),
                lead.getCreatedAt(),
                lead.getUpdatedAt());
    }
}
