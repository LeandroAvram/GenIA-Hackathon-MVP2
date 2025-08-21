import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from 'dotenv';
import { BedrockService } from './bedrock';
import { TranscribeService } from './transcribe';
import { unlinkSync } from 'fs';

config();

const app = express();
const port = process.env.PORT || 3000;
const bedrockService = new BedrockService();
const transcribeService = new TranscribeService();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await bedrockService.askQuestion(question);
    const totalTime = Date.now() - startTime;
    console.log(`Total chat response time: ${totalTime}ms`);
    res.json({ answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

app.post('/api/chat-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const transcript = await transcribeService.transcribeAudio(req.file.path);
    const answer = await bedrockService.askQuestion(transcript);
    
    unlinkSync(req.file.path);
    res.json({ transcript, answer });
  } catch (error) {
    console.error('Error:', error);
    if (req.file) unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});