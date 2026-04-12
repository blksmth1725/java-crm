package com.agentcrm.repository;

import com.agentcrm.entity.Interaction;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionRepository extends JpaRepository<Interaction, UUID> {

    long countByLead_Agent_Id(UUID agentId);

    long countByClient_Agent_Id(UUID agentId);

    List<Interaction> findByLead_IdOrderByOccurredAtDesc(UUID leadId);

    List<Interaction> findByClient_IdOrderByOccurredAtDesc(UUID clientId);
}
