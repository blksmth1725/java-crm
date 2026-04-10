package com.agentcrm.dto.task;

import com.agentcrm.entity.Task;
import com.agentcrm.entity.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID agentId,
        UUID leadId,
        UUID clientId,
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static TaskResponse fromEntity(Task task) {
        UUID leadId = task.getLead() != null ? task.getLead().getId() : null;
        UUID clientId = task.getClient() != null ? task.getClient().getId() : null;
        return new TaskResponse(
                task.getId(),
                task.getAgent().getId(),
                leadId,
                clientId,
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
