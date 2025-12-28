import express from 'express';
import { dbService } from '../services/JsonDatabaseService.js';
import { Question } from '../models/Question.js';
import { Result } from '../models/Result.js';
import { AnswerDTO } from '../models/AnswerDTO.js';

const router = express.Router();

/**
 * Shuffle array using seed for consistent ordering
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Seed value for consistent shuffling
 * @returns {Array} Shuffled array
 */
function shuffleWithSeed(array, seed) {
  const arr = [...array];
  let random = seed;

  for (let i = arr.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280;
    const j = Math.floor((random / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Simple hash function for email to seed
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * GET /api/questions/:section
 * Get shuffled questions for a specific section
 * Same user always gets questions in same order (seed based on email)
 */
router.get('/questions/:section', (req, res) => {
  try {
    const { section } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const allQuestions = dbService.loadData(Question);

    // Filter by section (case-insensitive)
    const filtered = allQuestions.filter(
      (q) => q.section.toLowerCase() === section.toLowerCase().trim()
    );

    if (filtered.length === 0) {
      return res.status(200).json([]);
    }

    // Shuffle using email hash as seed
    const seed = hashCode(email.toLowerCase().trim());
    const shuffled = shuffleWithSeed(filtered, seed);

    // Return top 20 questions (or fewer if not enough)
    const result = shuffled.slice(0, Math.min(shuffled.length, 20));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({
      error: `Failed to fetch questions: ${error.message}`,
    });
  }
});

/**
 * POST /api/result/submit
 * Submit exam answers and calculate results
 */
router.post('/result/submit', (req, res) => {
  try {
    const { candidateEmail, answers } = req.body;

    // Validate request
    if (!candidateEmail || !answers) {
      return res.status(400).json({ error: 'Invalid submission data.' });
    }

    const resultsList = dbService.loadData(Result);
    const questionsBank = dbService.loadData(Question);

    const email = candidateEmail.trim();

    // Prevent duplicate submission
    const alreadySubmitted = resultsList.some(
      (r) => r.candidateEmail.toLowerCase() === email.toLowerCase()
    );

    if (alreadySubmitted) {
      return res.status(409).json({ error: 'Exam already submitted.' });
    }

    let apt = 0,
      rea = 0,
      com = 0;

    // Calculate correct answers
    for (const userAns of answers) {
      const question = questionsBank.find(
        (q) => String(q.id) === String(userAns.questionId)
      );

      if (question) {
        if (
          question.correctOption &&
          userAns.selectedOption &&
          question.correctOption.trim().toLowerCase() ===
            userAns.selectedOption.trim().toLowerCase()
        ) {
          const section = question.section.toUpperCase();
          if (section.includes('APTITUDE')) {
            apt++;
          } else if (section.includes('REASONING')) {
            rea++;
          } else if (section.includes('COMMUNICATION')) {
            com++;
          }
        }
      }
    }

    // Create result
    const finalResult = new Result({
      id: resultsList.length + 1,
      candidateEmail: email,
      aptitudeCorrect: apt,
      reasoningCorrect: rea,
      communicationCorrect: com,
      totalCorrect: apt + rea + com,
    });

    // Calculate percentage (assuming 20 questions per section = 60 total)
    const rawPercentage = (finalResult.totalCorrect / 60.0) * 100.0;
    finalResult.percentage = Math.round(rawPercentage * 100) / 100;

    resultsList.push(finalResult);
    dbService.saveData(resultsList, Result);

    return res.status(200).json(finalResult);
  } catch (error) {
    console.error('Error submitting results:', error);
    return res.status(500).json({
      error: `Submission failed: ${error.message}`,
    });
  }
});

/**
 * GET /api/result/search
 * Search results by email and/or minimum percentage
 */
router.get('/result/search', (req, res) => {
  try {
    const { email, minPercentage = 0 } = req.query;
    const allResults = dbService.loadData(Result);

    const filtered = allResults.filter((r) => {
      const emailMatch =
        !email || r.candidateEmail.toLowerCase().includes(email.toLowerCase());
      const percentageMatch = r.percentage >= parseFloat(minPercentage || 0);
      return emailMatch && percentageMatch;
    });

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('Error searching results:', error);
    return res.status(500).json({
      error: `Search failed: ${error.message}`,
    });
  }
});

/**
 * GET /api/result/email/:email
 * Get result for a specific candidate email
 */
router.get('/result/email/:email', (req, res) => {
  try {
    const { email } = req.params;
    const allResults = dbService.loadData(Result);

    const userResult = allResults.find(
      (r) => r.candidateEmail.toLowerCase() === email.toLowerCase().trim()
    );

    if (userResult) {
      return res.status(200).json(userResult);
    } else {
      return res.status(404).json({ error: 'Result not found' });
    }
  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({
      error: `Failed to fetch result: ${error.message}`,
    });
  }
});

export default router;
