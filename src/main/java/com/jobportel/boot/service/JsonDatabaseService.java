package com.jobportel.boot.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class JsonDatabaseService {

    private final ObjectMapper mapper;
    private final Path root = Paths.get("exam_data");

    public JsonDatabaseService() {
        this.mapper = new ObjectMapper();
        this.mapper.enable(SerializationFeature.INDENT_OUTPUT);

        try {
            if (Files.notExists(root)) {
                Files.createDirectories(root);
                System.out.println(">>> Data folder created at: " + root.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println(">>> ERROR creating folder: " + e.getMessage());
        }
    }

    public <T> List<T> loadData(Class<T> clazz) {
        Path filePath = root.resolve(clazz.getSimpleName().toLowerCase() + "s.json");

        if (Files.notExists(filePath)) {
            return new ArrayList<>();
        }

        try {
            return mapper.readValue(
                filePath.toFile(),
                mapper.getTypeFactory()
                      .constructCollectionType(List.class, clazz)
            );
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    public <T> void saveData(List<T> data, Class<T> clazz) {
        Path filePath = root.resolve(clazz.getSimpleName().toLowerCase() + "s.json");

        try {
            mapper.writeValue(filePath.toFile(), data);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
