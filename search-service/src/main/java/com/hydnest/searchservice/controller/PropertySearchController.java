package com.hydnest.searchservice.controller;

import com.hydnest.searchservice.model.Property;
import com.hydnest.searchservice.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertySearchController {

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping("/properties")
    public Map<String, Object> searchProperties(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String propertyType,
        @RequestParam(required = false) String genderPreference,
        @RequestParam(required = false) String furnishing,
        @RequestParam(required = false) Integer minRent,
        @RequestParam(required = false) Integer maxRent
    ) {
        List<Property> results = propertyRepository.searchProperties(
            city, propertyType, genderPreference, furnishing, minRent, maxRent
        );

        return Map.of(
            "count", results.size(),
            "properties", results
        );
    }
}