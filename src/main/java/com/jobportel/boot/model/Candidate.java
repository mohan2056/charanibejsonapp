package com.jobportel.boot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
public class Candidate {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String college;
    private String branch;
    private String gender;
    private int backlogs;
    @JsonIgnore
    private byte[] resumeData;
    private String resumeName;
}