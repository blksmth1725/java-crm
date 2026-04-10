package com.agentcrm.service;

import com.agentcrm.dto.interaction.CreateInteractionRequest;
import com.agentcrm.dto.interaction.InteractionResponse;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Client;
import com.agentcrm.entity.Interaction;
import com.agentcrm.entity.Lead;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.repository.ClientRepository;
import com.agentcrm.repository.InteractionRepository;
import com.agentcrm.repository.LeadRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final AgentRepository agentRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;

    public InteractionService(
            InteractionRepository interactionRepository,
            AgentRepository agentRepository,
            LeadRepository leadRepository,
            ClientRepository clientRepository) {
        this.interactionRepository = interactionRepository;
        this.agentRepository = agentRepository;
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional(readOnly = true)
    public List<InteractionResponse> findByLeadId(UUID leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        return interactionRepository.findByLead_IdOrderByOccurredAtDesc(leadId).stream()
                .map(InteractionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InteractionResponse> findByClientId(UUID clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found");
        }
        return interactionRepository.findByClient_IdOrderByOccurredAtDesc(clientId).stream()
                .map(InteractionResponse::fromEntity)
                .toList();
    }

    @Transactional
    public InteractionResponse create(CreateInteractionRequest request) {
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
        Interaction interaction = new Interaction();
        interaction.setAgent(agent);
        interaction.setLead(lead);
        interaction.setClient(client);
        interaction.setType(request.type());
        interaction.setSummary(request.summary().trim());
        interaction.setOccurredAt(request.occurredAt());
        return InteractionResponse.fromEntity(interactionRepository.save(interaction));
    }

    @Transactional
    public void deleteById(UUID id) {
        if (!interactionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Interaction not found");
        }
        interactionRepository.deleteById(id);
    }
}
