# Quick Start Guide - Node.js Express Backend

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║    Online Exam JSON API Server        ║
║          Running on :8080             ║
╚════════════════════════════════════════╝
```

### 3. Test the API
Open your browser and visit:
```
http://localhost:8080
```

## 📝 Example API Calls

### Register a Candidate
```bash
curl -X POST http://localhost:8080/api/candidate/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=John Doe&email=john@example.com&phone=9999999999&college=XYZ&branch=CSE&gender=Male&backlogs=0"
```

### Get All Candidates
```bash
curl http://localhost:8080/api/candidate/all
```

### Get Questions for a Section
```bash
curl "http://localhost:8080/api/questions/APTITUDE?email=john@example.com"
```

### Submit Exam Answers
```bash
curl -X POST http://localhost:8080/api/result/submit \
  -H "Content-Type: application/json" \
  -d '{
    "candidateEmail": "john@example.com",
    "answers": [
      {"questionId": 1, "selectedOption": "A"},
      {"questionId": 2, "selectedOption": "B"}
    ]
  }'
```

### Get Result by Email
```bash
curl http://localhost:8080/api/result/email/john@example.com
```

### Search Results
```bash
curl "http://localhost:8080/api/result/search?email=john&minPercentage=50"
```

## 🛠️ Development Mode

For development with auto-reload on file changes:
```bash
npm run dev
```

## 📦 Project Files

| File/Folder | Purpose |
|------------|---------|
| `src/index.js` | Main Express server |
| `src/models/` | Data model classes |
| `src/services/` | Database service |
| `src/routes/` | API route handlers |
| `exam_data/` | JSON database files |
| `package.json` | Dependencies & scripts |
| `README.md` | Full documentation |
| `MIGRATION_SUMMARY.md` | Details of Java→Node conversion |

## 🔧 Environment Configuration

Create a `.env` file to customize:
```
PORT=8080
NODE_ENV=development
```

## 📊 Sample Data Structure

### Candidates File (exam_data/candidates.json)
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9999999999",
    "college": "XYZ University",
    "branch": "CSE",
    "gender": "Male",
    "backlogs": 0,
    "resumeName": null
  }
]
```

### Questions File (exam_data/questions.json)
```json
[
  {
    "id": 1,
    "section": "APTITUDE",
    "question": "What is the capital of France?",
    "optionA": "London",
    "optionB": "Paris",
    "optionC": "Berlin",
    "optionD": "Madrid",
    "correctOption": "B"
  }
]
```

## ✨ Key Features

✅ RESTful API for exam management
✅ Candidate registration with resume upload
✅ Question organization by sections
✅ Automatic exam scoring
✅ Result tracking and search
✅ CORS enabled for frontend integration
✅ JSON-based persistence
✅ Deterministic question shuffling

## 🔗 Frontend Integration

The frontend (React/Vue/Angular) can connect to any of these endpoints:

**Base URL**: `http://localhost:8080` (or your server URL)

**CORS is enabled** for:
- `http://localhost:3000`
- `http://localhost:5173`
- `https://charanionlineexam.vercel.app`

To add more allowed origins, edit the `cors` configuration in `src/index.js`.

## 🐛 Troubleshooting

### Port 8080 already in use?
```bash
PORT=3001 npm start
```

### Module not found error?
```bash
npm install
```

### File permissions on exam_data?
Ensure the `exam_data/` directory has write permissions:
```bash
chmod -R 755 exam_data
```

### Resume upload not working?
Check that `exam_data/` directory exists. It will be created automatically on first run.

## 📚 Learn More

- See `README.md` for detailed API documentation
- See `MIGRATION_SUMMARY.md` for Java to Node conversion details
- Visit [Express.js docs](https://expressjs.com/)

## 🎯 Next Steps

1. Populate `exam_data/*.json` with your exam data
2. Connect your frontend to these API endpoints
3. Test all functionality end-to-end
4. Deploy to production (Vercel, AWS, Heroku, etc.)

---

**Happy coding! 🎉**
