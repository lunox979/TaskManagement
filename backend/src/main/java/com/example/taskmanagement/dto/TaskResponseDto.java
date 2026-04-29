package com.example.taskmanagement.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponseDto(
        Integer id,
        String title,
        String description,
        String status,
        String priority,
        LocalDate dueDate,
        Integer orderIndex,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
