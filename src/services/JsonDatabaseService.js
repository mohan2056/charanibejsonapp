import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class JsonDatabaseService {
  constructor() {
    this.root = path.join(__dirname, '..', '..', 'exam_data');
    this.initializeDataFolder();
  }

  initializeDataFolder() {
    if (!fs.existsSync(this.root)) {
      fs.mkdirSync(this.root, { recursive: true });
      console.log('>>> Data folder created at:', path.resolve(this.root));
    }
  }

  /**
   * Load data from JSON file
   * @param {Function} clazz - Model class (e.g., Candidate)
   * @returns {Array} Array of objects
   */
  loadData(clazz) {
    const fileName = clazz.name.toLowerCase() + 's.json';
    const filePath = path.join(this.root, fileName);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error.message);
      return [];
    }
  }

  /**
   * Save data to JSON file
   * @param {Array} data - Array of objects to save
   * @param {Function} clazz - Model class (e.g., Candidate)
   */
  saveData(data, clazz) {
    const fileName = clazz.name.toLowerCase() + 's.json';
    const filePath = path.join(this.root, fileName);

    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonData, 'utf8');
    } catch (error) {
      console.error(`Error writing ${fileName}:`, error.message);
    }
  }

  /**
   * Save resume file
   * @param {Buffer} fileBuffer - File buffer from upload
   * @param {string} filename - Original filename
   * @returns {string} Path where file was saved
   */
  saveResume(fileBuffer, filename) {
    const resumeDir = path.join(this.root, 'resumes');
    
    if (!fs.existsSync(resumeDir)) {
      fs.mkdirSync(resumeDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = `${timestamp}_${filename}`;
    const filePath = path.join(resumeDir, safeName);

    try {
      fs.writeFileSync(filePath, fileBuffer);
      return safeName;
    } catch (error) {
      console.error('Error saving resume:', error.message);
      return null;
    }
  }

  /**
   * Get resume file
   * @param {string} filename - Resume filename
   * @returns {Buffer} File buffer or null
   */
  getResume(filename) {
    const filePath = path.join(this.root, 'resumes', filename);

    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
      return null;
    } catch (error) {
      console.error('Error reading resume:', error.message);
      return null;
    }
  }
}

export const dbService = new JsonDatabaseService();
