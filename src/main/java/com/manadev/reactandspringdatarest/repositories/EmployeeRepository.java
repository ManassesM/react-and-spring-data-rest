package com.manadev.reactandspringdatarest.repositories;

import com.manadev.reactandspringdatarest.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {}
