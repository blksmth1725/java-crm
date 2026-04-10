package com.agentcrm.dto.lead;

import com.agentcrm.entity.LeadStatus;
import java.util.UUID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateLeadRequest(
        @NotNull UUID agentId,
        @NotBlank @Size(max = 120) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @NotBlank @Email @Size(max = 320) String email,
        @Size(max = 64) String phone,
        @Size(max = 120) String region,
        LeadStatus status,
        String notes) {}
