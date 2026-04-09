package com.agentcrm.controller;

import com.agentcrm.dto.agent.AgentResponse;
import com.agentcrm.dto.agent.CreateAgentRequest;
import com.agentcrm.dto.agent.UpdateAgentRequest;
import com.agentcrm.service.AgentService;
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
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public List<AgentResponse> list() {
        return agentService.findAll();
    }

    @GetMapping("/{id}")
    public AgentResponse get(@PathVariable UUID id) {
        return agentService.findById(id);
    }

    @PostMapping
    public ResponseEntity<AgentResponse> create(@Valid @RequestBody CreateAgentRequest request) {
        AgentResponse created = agentService.create(request);
        URI location = URI.create("/api/agents/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public AgentResponse update(
            @PathVariable UUID id, @Valid @RequestBody UpdateAgentRequest request) {
        return agentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        agentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
