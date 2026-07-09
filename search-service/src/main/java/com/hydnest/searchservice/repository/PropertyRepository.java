package com.hydnest.searchservice.repository;

import com.hydnest.searchservice.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("SELECT p FROM Property p WHERE p.available = true " +
           "AND (:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
           "AND (:propertyType IS NULL OR p.propertyType = CAST(:propertyType AS string)) " +
           "AND (:genderPreference IS NULL OR p.genderPreference = CAST(:genderPreference AS string)) " +
           "AND (:furnishing IS NULL OR p.furnishing = CAST(:furnishing AS string)) " +
           "AND (:minRent IS NULL OR p.rent >= :minRent) " +
           "AND (:maxRent IS NULL OR p.rent <= :maxRent) " +
           "ORDER BY p.createdAt DESC")
    List<Property> searchProperties(
        @Param("city") String city,
        @Param("propertyType") String propertyType,
        @Param("genderPreference") String genderPreference,
        @Param("furnishing") String furnishing,
        @Param("minRent") Integer minRent,
        @Param("maxRent") Integer maxRent
    );
}