package com.manadev.reactandspringdatarest;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long>, CrudRepository<Employee, Long> {}