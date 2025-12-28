package com.jobportel.boot.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jobportel.boot.model.Candidate;
import com.jobportel.boot.service.JsonDatabaseService;

@RestController
@RequestMapping("/api/candidate")
@CrossOrigin(origins = "https://charanionlineexam.vercel.app")
public class CandidateController {

    @Autowired
    private JsonDatabaseService dbService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @ModelAttribute Candidate candidate,
            @RequestParam(value = "resume", required = false) MultipartFile file) {

        try {
            List<Candidate> list = dbService.loadData(Candidate.class);

            if (candidate.getEmail() == null || candidate.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            // check duplicate
            String email = candidate.getEmail().trim();
            if (list.stream().anyMatch(c -> c.getEmail().equalsIgnoreCase(email))) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered!");
            }

            // Handle Resume upload
            if (file != null && !file.isEmpty()) {
                candidate.setResumeData(file.getBytes());
                candidate.setResumeName(file.getOriginalFilename());
            }

            candidate.setId((long) (list.size() + 1));
            candidate.setEmail(email);
            list.add(candidate);
            
            dbService.saveData(list, Candidate.class);

            return ResponseEntity.ok(candidate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<Candidate> getAllCandidates() {
        return dbService.loadData(Candidate.class);
    }
}
