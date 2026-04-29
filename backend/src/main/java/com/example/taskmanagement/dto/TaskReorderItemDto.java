package com.example.taskmanagement.dto;

import jakarta.validation.constraints.NotNull;

public record TaskReorderItemDto(
        @NotNull Integer id,
        @NotNull Integer orderIndex,
        String status
) {}
