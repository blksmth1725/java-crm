package com.agentcrm.service;

import com.agentcrm.dto.client.ClientResponse;
import com.agentcrm.dto.client.CreateClientRequest;
import com.agentcrm.dto.client.UpdateClientRequest;
import com.agentcrm.entity.Agent;
import com.agentcrm.entity.Client;
import com.agentcrm.entity.Lead;
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
public class ClientService {

    private final ClientRepository clientRepository;
    private final AgentRepository agentRepository;
    private final LeadRepository leadRepository;

    public ClientService(
            ClientRepository clientRepository,
            AgentRepository agentRepository,
            LeadRepository leadRepository) {
        this.clientRepository = clientRepository;
        this.agentRepository = agentRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return clientRepository.findAll().stream().map(ClientResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        return clientRepository
                .findById(id)
                .map(ClientResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> findByAgentId(UUID agentId) {
        if (!agentRepository.existsById(agentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
        }
        return clientRepository.findByAgent_Id(agentId).stream()
                .map(ClientResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ClientResponse create(CreateClientRequest request) {
        Agent agent = agentRepository
                .findById(request.agentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found"));
        String email = request.email().trim().toLowerCase();
        if (clientRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use for a client");
        }
        Lead lead = null;
        if (request.leadId() != null) {
            lead = leadRepository
                    .findById(request.leadId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
            if (!lead.getAgent().getId().equals(agent.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lead belongs to a different agent");
            }
            if (clientRepository.findByLead_Id(lead.getId()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Lead already linked to a client");
            }
        }
        Client client = new Client();
        client.setAgent(agent);
        client.setLead(lead);
        client.setFirstName(request.firstName().trim());
        client.setLastName(request.lastName().trim());
        client.setEmail(email);
        client.setPhone(trimToNull(request.phone()));
        client.setRegion(trimToNull(request.region()));
        client.setNotes(request.notes());
        return ClientResponse.fromEntity(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(UUID id, UpdateClientRequest request) {
        Client client = clientRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
        String email = request.email().trim().toLowerCase();
        if (clientRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use for a client");
        }
        client.setFirstName(request.firstName().trim());
        client.setLastName(request.lastName().trim());
        client.setEmail(email);
        client.setPhone(trimToNull(request.phone()));
        client.setRegion(trimToNull(request.region()));
        client.setNotes(request.notes());
        return ClientResponse.fromEntity(client);
    }

    @Transactional
    public void deleteById(UUID id) {
        if (!clientRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found");
        }
        clientRepository.deleteById(id);
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
