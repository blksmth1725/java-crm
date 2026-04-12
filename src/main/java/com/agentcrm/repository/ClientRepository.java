package com.agentcrm.repository;

import com.agentcrm.entity.Client;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    long countByAgent_Id(UUID agentId);

    List<Client> findByAgent_Id(UUID agentId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    Optional<Client> findByLead_Id(UUID leadId);
}
