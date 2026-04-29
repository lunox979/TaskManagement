package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.TaskResponseDto;
import com.example.taskmanagement.entity.Task;
import com.example.taskmanagement.exception.TaskNotFoundException;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public List<TaskResponseDto> getAllTasks() {
        return taskRepository.findAllByOrderByOrderIndexAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<TaskResponseDto> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public TaskResponseDto getTaskById(Integer id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return toDto(task);
    }

    private TaskResponseDto toDto(Task task) {
        return new TaskResponseDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getOrderIndex(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
