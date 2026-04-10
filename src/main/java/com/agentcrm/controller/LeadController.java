package com.agentcrm.controller;

import com.agentcrm.dto.client.ClientResponse;
import com.agentcrm.dto.lead.CreateLeadRequest;
import com.agentcrm.dto.lead.LeadResponse;
import com.agentcrm.dto.lead.UpdateLeadRequest;
import com.agentcrm.service.LeadService;
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
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public List<LeadResponse> list() {
        return leadService.findAll();
    }

    @GetMapping("/agent/{agentId}")
    public List<LeadResponse> listByAgent(@PathVariable UUID agentId) {
        return leadService.findByAgentId(agentId);
    }

    @GetMapping("/{id}")
    public LeadResponse get(@PathVariable UUID id) {
        return leadService.findById(id);
    }

    @PostMapping
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody CreateLeadRequest request) {
        LeadResponse created = leadService.create(request);
        URI location = URI.create("/api/leads/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public LeadResponse update(
            @PathVariable UUID id, @Valid @RequestBody UpdateLeadRequest request) {
        return leadService.update(id, request);
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<ClientResponse> convert(@PathVariable UUID id) {
        ClientResponse client = leadService.convertToClient(id);
        URI location = URI.create("/api/clients/" + client.id());
        return ResponseEntity.created(location).body(client);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        leadService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
