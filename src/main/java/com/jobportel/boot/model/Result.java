package com.jobportel.boot.model;

import lombok.Data;

@Data
public class Result {
    private Long id;
    private String candidateEmail;
    private int aptitudeCorrect;
    private int reasoningCorrect;
    private int communicationCorrect;
    private int totalCorrect;
    private double percentage;
}