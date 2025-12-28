package com.jobportel.boot.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportel.boot.dto.AnswerDTO;
import com.jobportel.boot.dto.SubmitRequest;
import com.jobportel.boot.model.Question;
import com.jobportel.boot.model.Result;
import com.jobportel.boot.service.JsonDatabaseService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://charanionlineexam.vercel.app")
public class ExamResultController {

    @Autowired
    private JsonDatabaseService dbService;

    @GetMapping("/questions/{section}")
    public List<Question> getQuestions(@PathVariable String section, @RequestParam String email) {
        List<Question> all = dbService.loadData(Question.class);
        
        // Filter by section
        List<Question> filtered = all.stream()
                .filter(q -> q.getSection().equalsIgnoreCase(section.trim()))
                .toList();
        
        // Shuffle using Email hash as Seed (same user gets same questions in same order)
        List<Question> shuffleList = new ArrayList<>(filtered);
        long seed = email.toLowerCase().trim().hashCode();
        Collections.shuffle(shuffleList, new Random(seed));
        
        return shuffleList.subList(0, Math.min(shuffleList.size(), 20));
    }

  

    @PostMapping("/result/submit")
    public ResponseEntity<?> submit(@RequestBody SubmitRequest request) {
        // 1. Validate request
        if (request == null || request.getAnswers() == null) {
            return ResponseEntity.badRequest().body("Invalid submission data.");
        }

        List<Result> results = dbService.loadData(Result.class);
        List<Question> questionsBank = dbService.loadData(Question.class);

        // 2. Prevent duplicate submission
        String email = request.getCandidateEmail().trim();
        if (results.stream().anyMatch(r -> r.getCandidateEmail().equalsIgnoreCase(email))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Exam already submitted.");
        }

        int apt = 0, rea = 0, com = 0;

        // 3. Calculation logic
        for (AnswerDTO userAns : request.getAnswers()) {
            Optional<Question> questionOpt = questionsBank.stream()
                    .filter(q -> String.valueOf(q.getId()).equals(String.valueOf(userAns.getQuestionId())))
                    .findFirst();

            if (questionOpt.isPresent()) {
                Question q = questionOpt.get();
                if (q.getCorrectOption() != null && userAns.getSelectedOption() != null) {
                    if (q.getCorrectOption().trim().equalsIgnoreCase(userAns.getSelectedOption().trim())) {
                        String section = q.getSection().toUpperCase();
                        if (section.contains("APTITUDE")) apt++;
                        else if (section.contains("REASONING")) rea++;
                        else if (section.contains("COMMUNICATION")) com++;
                    }
                }
            }
        }

        // 4. Create and Save Result
        Result finalRes = new Result();
        finalRes.setId((long) (results.size() + 1));
        finalRes.setCandidateEmail(email);
        finalRes.setAptitudeCorrect(apt);
        finalRes.setReasoningCorrect(rea);
        finalRes.setCommunicationCorrect(com);
        finalRes.setTotalCorrect(apt + rea + com);
        
        // Assumes 20 questions per section (Total 60)
        double rawPercentage = ((double) finalRes.getTotalCorrect() / 60.0) * 100.0;
        finalRes.setPercentage(Math.round(rawPercentage * 100.0) / 100.0);

        results.add(finalRes);
        dbService.saveData(results, Result.class);

        return ResponseEntity.ok(finalRes);
    }@GetMapping("/result/search")
    public List<Result> searchResults(
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "0") double minPercentage) {
        
        List<Result> all = dbService.loadData(Result.class);
        return all.stream()
                .filter(r -> email == null || r.getCandidateEmail().toLowerCase().contains(email.toLowerCase()))
                .filter(r -> r.getPercentage() >= minPercentage)
                .toList();
    }
 // Add this inside ExamResultController.java

    @GetMapping("/result/email/{email}")
    public ResponseEntity<?> getResultByEmail(@PathVariable String email) {
        List<Result> allResults = dbService.loadData(Result.class);
        
        Optional<Result> userResult = allResults.stream()
                .filter(r -> r.getCandidateEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
                
        if (userResult.isPresent()) {
            return ResponseEntity.ok(userResult.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Result not found");
        }
    }
}
