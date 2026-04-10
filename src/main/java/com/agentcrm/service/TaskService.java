package com.agentcrm.service;

import com.agentcrm.dto.task.CreateTaskRequest;
import com.agentcrm.dto.task.TaskResponse;
import com.agentcrm.dto.task.UpdateTaskRequest;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Client;
import com.agentcrm.entity.Lead;
import com.agentcrm.entity.Task;
import com.agentcrm.entity.TaskStatus;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.repository.ClientRepository;
import com.agentcrm.repository.LeadRepository;
import com.agentcrm.repository.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final AgentRepository agentRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;

    public TaskService(
            TaskRepository taskRepository,
            AgentRepository agentRepository,
            LeadRepository leadRepository,
            ClientRepository clientRepository) {
        this.taskRepository = taskRepository;
        this.agentRepository = agentRepository;
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByAgentId(UUID agentId) {
        if (!agentRepository.existsById(agentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
        }
        return taskRepository.findByAgent_Id(agentId).stream().map(TaskResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByLeadId(UUID leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        return taskRepository.findByLead_Id(leadId).stream().map(TaskResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByClientId(UUID clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found");
        }
        return taskRepository.findByClient_Id(clientId).stream().map(TaskResponse::fromEntity).toList();
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        boolean hasLead = request.leadId() != null;
        boolean hasClient = request.clientId() != null;
        if (hasLead == hasClient) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Provide exactly one of leadId or clientId");
        }
        Agent agent = agentRepository
                .findById(request.agentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        Lead lead = null;
        Client client = null;
        if (hasLead) {
            lead = leadRepository
                    .findById(request.leadId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
            if (!lead.getAgent().getId().equals(agent.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead belongs to a different agent");
            }
        } else {
            client = clientRepository
                    .findById(request.clientId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
            if (!client.getAgent().getId().equals(agent.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Client belongs to a different agent");
            }
        }
        Task task = new Task();
        task.setAgent(agent);
        task.setLead(lead);
        task.setClient(client);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setStatus(request.status() != null ? request.status() : TaskStatus.PENDING);
        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(UUID id, UpdateTaskRequest request) {
        Task task = taskRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setStatus(request.status());
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public void deleteById(UUID id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        taskRepository.deleteById(id);
    }
}
