package com.agentcrm.controller;

import com.agentcrm.dto.interaction.CreateInteractionRequest;
import com.agentcrm.dto.interaction.InteractionResponse;
import com.agentcrm.service.InteractionService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    private final InteractionService interactionService;

    public InteractionController(InteractionService interactionService) {
        this.interactionService = interactionService;
    }

    @PostMapping
    public ResponseEntity<InteractionResponse> create(
            @Valid @RequestBody CreateInteractionRequest request) {
        InteractionResponse created = interactionService.create(request);
        URI location = URI.create("/api/interactions/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/lead/{leadId}")
    public List<InteractionResponse> listByLead(@PathVariable UUID leadId) {
        return interactionService.findByLeadId(leadId);
    }

    @GetMapping("/client/{clientId}")
    public List<InteractionResponse> listByClient(@PathVariable UUID clientId) {
        return interactionService.findByClientId(clientId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        interactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
