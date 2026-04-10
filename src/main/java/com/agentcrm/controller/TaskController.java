package com.agentcrm.controller;

import com.agentcrm.dto.task.CreateTaskRequest;
import com.agentcrm.dto.task.TaskResponse;
import com.agentcrm.dto.task.UpdateTaskRequest;
import com.agentcrm.service.TaskService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse created = taskService.create(request);
        URI location = URI.create("/api/tasks/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/agent/{agentId}")
    public List<TaskResponse> listByAgent(@PathVariable UUID agentId) {
        return taskService.findByAgentId(agentId);
    }

    @GetMapping("/lead/{leadId}")
    public List<TaskResponse> listByLead(@PathVariable UUID leadId) {
        return taskService.findByLeadId(leadId);
    }

    @GetMapping("/client/{clientId}")
    public List<TaskResponse> listByClient(@PathVariable UUID clientId) {
        return taskService.findByClientId(clientId);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
