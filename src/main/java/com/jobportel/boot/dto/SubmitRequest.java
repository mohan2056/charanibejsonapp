package com.jobportel.boot.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRequest {
    private String candidateEmail;
    private List<AnswerDTO> answers;
}