package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.TaskCreateRequestDto;
import com.example.taskmanagement.dto.TaskReorderItemDto;
import com.example.taskmanagement.dto.TaskResponseDto;
import com.example.taskmanagement.dto.TaskUpdateRequestDto;
import com.example.taskmanagement.entity.Task;
import com.example.taskmanagement.exception.TaskNotFoundException;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Override
    @Transactional
    public TaskResponseDto createTask(TaskCreateRequestDto request) {
        int nextOrder = taskRepository.findAll().stream()
                .mapToInt(Task::getOrderIndex)
                .max()
                .orElse(0) + 1;

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : "todo");
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setOrderIndex(nextOrder);

        return toDto(taskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponseDto updateTask(Integer id, TaskUpdateRequestDto request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        return toDto(taskRepository.save(task));
    }

    @Override
    @Transactional
    public void reorderTasks(List<TaskReorderItemDto> items) {
        List<Integer> ids = items.stream().map(TaskReorderItemDto::id).toList();
        Map<Integer, Task> taskMap = taskRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Task::getId, t -> t));
        for (TaskReorderItemDto item : items) {
            Task task = taskMap.get(item.id());
            if (task == null) throw new TaskNotFoundException(item.id());
            task.setOrderIndex(item.orderIndex());
            if (item.status() != null) task.setStatus(item.status());
        }
        taskRepository.saveAll(taskMap.values());
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
