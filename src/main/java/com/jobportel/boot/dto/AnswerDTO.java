package com.jobportel.boot.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDTO {
    private Object questionId; // Use Object to handle both String and Long safely
    private String selectedOption;
}