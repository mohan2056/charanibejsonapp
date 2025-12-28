package com.jobportel.boot.model;

import lombok.Data;

@Data
public class Question {
    private Long id;
    private String section;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
}