package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.TaskCreateRequestDto;
import com.example.taskmanagement.dto.TaskResponseDto;

import java.util.List;

public interface TaskService {
    List<TaskResponseDto> getAllTasks();
    List<TaskResponseDto> getTasksByStatus(String status);
    TaskResponseDto getTaskById(Integer id);
    TaskResponseDto createTask(TaskCreateRequestDto request);
}
