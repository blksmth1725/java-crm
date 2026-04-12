package com.agentcrm.repository;

import com.agentcrm.entity.Report;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByAgent_IdOrderByReportDateDesc(UUID agentId);

    Optional<Report> findByAgent_IdAndReportDate(UUID agentId, LocalDate reportDate);
}
