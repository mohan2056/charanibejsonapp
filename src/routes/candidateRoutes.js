import express from 'express';
import { dbService } from '../services/JsonDatabaseService.js';
import { Candidate } from '../models/Candidate.js';

const router = express.Router();

/**
 * POST /api/candidate/register
 * Register a new candidate with optional resume upload
 */
router.post('/register', (req, res) => {
  try {
    const candidateList = dbService.loadData(Candidate);

    const { name, email, phone, college, branch, gender, backlogs } = req.body;

    // Validate email
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const trimmedEmail = email.trim();

    // Check duplicate email
    const emailExists = candidateList.some(
      (c) => c.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (emailExists) {
      return res.status(409).json({ error: 'Email already registered!' });
    }

    // Create new candidate
    const newCandidate = new Candidate({
      id: candidateList.length + 1,
      name,
      email: trimmedEmail,
      phone,
      college,
      branch,
      gender,
      backlogs: parseInt(backlogs) || 0,
    });

    // Handle resume upload if present
    if (req.files && req.files.resume) {
      const resumeFile = req.files.resume;
      const savedResumeName = dbService.saveResume(
        resumeFile.data,
        resumeFile.name
      );
      if (savedResumeName) {
        newCandidate.resumeName = savedResumeName;
      }
    }

    candidateList.push(newCandidate);
    dbService.saveData(candidateList, Candidate);

    return res.status(200).json(newCandidate);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: `Registration failed: ${error.message}`,
    });
  }
});

/**
 * GET /api/candidate/all
 * Get all registered candidates
 */
router.get('/all', (req, res) => {
  try {
    const candidateList = dbService.loadData(Candidate);
    return res.status(200).json(candidateList);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({
      error: `Failed to fetch candidates: ${error.message}`,
    });
  }
});

export default router;
