package com.agentcrm.repository;

import com.agentcrm.entity.Lead;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeadRepository extends JpaRepository<Lead, UUID> {

    long countByAgent_Id(UUID agentId);

    @Query(
            "SELECT l.status, COUNT(l) FROM Lead l WHERE l.agent.id = :agentId GROUP BY l.status")
    List<Object[]> countByAgentIdGroupByStatus(@Param("agentId") UUID agentId);

    List<Lead> findByAgent_Id(UUID agentId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
}
