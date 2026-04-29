package com.example.taskmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskCreateRequestDto(
        @NotBlank @Size(max = 255) String title,
        String description,
        String status,
        String priority,
        LocalDate dueDate
) {}
