package com.agentcrm.dto.task;

import com.agentcrm.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(
        @NotNull UUID agentId,
        UUID leadId,
        UUID clientId,
        @NotBlank @Size(max = 200) String title,
        String description,
        @NotNull LocalDate dueDate,
        TaskStatus status) {}
