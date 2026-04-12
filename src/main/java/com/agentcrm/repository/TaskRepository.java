package com.agentcrm.repository;

import com.agentcrm.entity.Task;
import com.agentcrm.entity.TaskStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    long countByAgent_IdAndStatusIn(UUID agentId, List<TaskStatus> statuses);

    List<Task> findByAgent_Id(UUID agentId);

    List<Task> findByLead_Id(UUID leadId);

    List<Task> findByClient_Id(UUID clientId);
}
