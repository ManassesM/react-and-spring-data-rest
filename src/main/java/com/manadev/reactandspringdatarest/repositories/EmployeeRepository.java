package com.manadev.reactandspringdatarest.repositories;

import com.manadev.reactandspringdatarest.entities.Employee;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long> {}
