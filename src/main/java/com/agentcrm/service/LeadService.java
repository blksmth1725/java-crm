package com.agentcrm.service;

import com.agentcrm.dto.client.ClientResponse;
import com.agentcrm.dto.lead.CreateLeadRequest;
import com.agentcrm.dto.lead.LeadResponse;
import com.agentcrm.dto.lead.UpdateLeadRequest;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Client;
import com.agentcrm.entity.Lead;
import com.agentcrm.entity.LeadStatus;
import com.agentcrm.repository.AgentRepository;
import com.agentcrm.repository.ClientRepository;
import com.agentcrm.repository.LeadRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final AgentRepository agentRepository;
    private final ClientRepository clientRepository;

    public LeadService(
            LeadRepository leadRepository,
            AgentRepository agentRepository,
            ClientRepository clientRepository) {
        this.leadRepository = leadRepository;
        this.agentRepository = agentRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> findAll() {
        return leadRepository.findAll().stream().map(LeadResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse findById(UUID id) {
        return leadRepository
                .findById(id)
                .map(LeadResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> findByAgentId(UUID agentId) {
        if (!agentRepository.existsById(agentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
        }
        return leadRepository.findByAgent_Id(agentId).stream().map(LeadResponse::fromEntity).toList();
    }

    @Transactional
    public LeadResponse create(CreateLeadRequest request) {
        Agent agent = agentRepository
                .findById(request.agentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        String email = request.email().trim().toLowerCase();
        if (leadRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use for a lead");
        }
        Lead lead = new Lead();
        lead.setAgent(agent);
        lead.setFirstName(request.firstName().trim());
        lead.setLastName(request.lastName().trim());
        lead.setEmail(email);
        lead.setPhone(trimToNull(request.phone()));
        lead.setRegion(trimToNull(request.region()));
        lead.setStatus(request.status() != null ? request.status() : LeadStatus.NEW);
        lead.setNotes(request.notes());
        Lead saved = leadRepository.save(lead);
        ensureClientWhenClosedWon(saved);
        return LeadResponse.fromEntity(saved);
    }

    @Transactional
    public LeadResponse update(UUID id, UpdateLeadRequest request) {
        Lead lead = leadRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        String email = request.email().trim().toLowerCase();
        if (leadRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use for a lead");
        }
        lead.setFirstName(request.firstName().trim());
        lead.setLastName(request.lastName().trim());
        lead.setEmail(email);
        lead.setPhone(trimToNull(request.phone()));
        lead.setRegion(trimToNull(request.region()));
        lead.setStatus(request.status());
        lead.setNotes(request.notes());
        ensureClientWhenClosedWon(lead);
        return LeadResponse.fromEntity(lead);
    }

    @Transactional
    public void deleteById(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        }
        leadRepository.deleteById(id);
    }

    @Transactional
    public ClientResponse convertToClient(UUID leadId) {
        Lead lead = leadRepository
                .findById(leadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        if (clientRepository.findByLead_Id(leadId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lead already converted to a client");
        }
        if (lead.getStatus() != LeadStatus.CLOSED_WON) {
            lead.setStatus(LeadStatus.CLOSED_WON);
        }
        Client client = createClientForClosedWonLead(lead);
        leadRepository.save(lead);
        return ClientResponse.fromEntity(client);
    }

    private void ensureClientWhenClosedWon(Lead lead) {
        if (lead.getStatus() != LeadStatus.CLOSED_WON) {
            return;
        }
        if (clientRepository.findByLead_Id(lead.getId()).isPresent()) {
            return;
        }
        createClientForClosedWonLead(lead);
    }

    private Client createClientForClosedWonLead(Lead lead) {
        if (lead.getStatus() != LeadStatus.CLOSED_WON) {
            throw new IllegalStateException("Client can only be created for a closed-won lead");
        }
        if (clientRepository.existsByEmailIgnoreCase(lead.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use for a client");
        }
        Client client = new Client();
        client.setAgent(lead.getAgent());
        client.setLead(lead);
        client.setFirstName(lead.getFirstName());
        client.setLastName(lead.getLastName());
        client.setEmail(lead.getEmail());
        client.setPhone(lead.getPhone());
        client.setRegion(lead.getRegion());
        client.setNotes(lead.getNotes());
        return clientRepository.save(client);
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
