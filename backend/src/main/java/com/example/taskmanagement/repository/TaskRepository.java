package com.example.taskmanagement.repository;

import com.example.taskmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {

    List<Task> findAllByOrderByOrderIndexAsc();

    List<Task> findByStatus(String status);

    @Query("SELECT COALESCE(MAX(t.orderIndex), 0) FROM Task t")
    int findMaxOrderIndex();
}
