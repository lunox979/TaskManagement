package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.TaskCreateRequestDto;
import com.example.taskmanagement.dto.TaskReorderItemDto;
import com.example.taskmanagement.dto.TaskResponseDto;
import com.example.taskmanagement.dto.TaskUpdateRequestDto;

import java.util.List;

public interface TaskService {
    List<TaskResponseDto> getAllTasks();
    List<TaskResponseDto> getTasksByStatus(String status);
    TaskResponseDto getTaskById(Integer id);
    TaskResponseDto createTask(TaskCreateRequestDto request);
    TaskResponseDto updateTask(Integer id, TaskUpdateRequestDto request);
    void reorderTasks(List<TaskReorderItemDto> items);
    void deleteTask(Integer id);
}
