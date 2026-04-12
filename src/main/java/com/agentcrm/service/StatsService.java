package com.agentcrm.service;

import com.agentcrm.dto.stats.PipelineStatsResponse;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.LeadStatus;
import com.agentcrm.entity.TaskStatus;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.repository.ClientRepository;
import com.agentcrm.repository.InteractionRepository;
import com.agentcrm.repository.LeadRepository;
import com.agentcrm.repository.TaskRepository;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StatsService {

    private final AgentRepository agentRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final InteractionRepository interactionRepository;
    private final TaskRepository taskRepository;

    public StatsService(
            AgentRepository agentRepository,
            LeadRepository leadRepository,
            ClientRepository clientRepository,
            InteractionRepository interactionRepository,
            TaskRepository taskRepository) {
        this.agentRepository = agentRepository;
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
        this.interactionRepository = interactionRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public PipelineStatsResponse getPipelineStats(UUID agentId) {
        Agent agent =
                agentRepository
                        .findById(agentId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));

        long totalLeads = leadRepository.countByAgent_Id(agentId);
        Map<LeadStatus, Long> leadsByStatus = new EnumMap<>(LeadStatus.class);
        for (LeadStatus status : LeadStatus.values()) {
            leadsByStatus.put(status, 0L);
        }
        for (Object[] row : leadRepository.countByAgentIdGroupByStatus(agentId)) {
            LeadStatus status = (LeadStatus) row[0];
            long count = ((Number) row[1]).longValue();
            leadsByStatus.put(status, count);
        }

        long totalClients = clientRepository.countByAgent_Id(agentId);
        long totalInteractions =
                interactionRepository.countByLead_Agent_Id(agentId)
                        + interactionRepository.countByClient_Agent_Id(agentId);
        long totalPendingTasks =
                taskRepository.countByAgent_IdAndStatusIn(
                        agentId, List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS));

        String agentName = agent.getFirstName() + " " + agent.getLastName();
        return new PipelineStatsResponse(
                agent.getId(),
                agentName,
                totalLeads,
                Map.copyOf(leadsByStatus),
                totalClients,
                totalInteractions,
                totalPendingTasks,
                LocalDateTime.now());
    }
}
