package org.example.userservice.repository;

import org.example.userservice.model.ChurnAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChurnAnalysisRepository extends JpaRepository<ChurnAnalysis, Integer> {

    ChurnAnalysis findByUserId(Integer userId);
}