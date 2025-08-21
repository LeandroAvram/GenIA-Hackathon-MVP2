# GenAI Backend

Minimal Node.js TypeScript backend with Express that connects to Amazon Bedrock and knowledge store.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and knowledge base ID
```

3. Run development server:
```bash
npm run dev
```

## API

**POST /ask**
```json
{
  "question": "Your question here"
}
```

Response:
```json
{
  "answer": "AI generated answer"
}
```

## Environment Variables

- `AWS_REGION`: AWS region (default: us-east-1)
- `KNOWLEDGE_BASE_ID`: Optional knowledge base ID
- `MODEL_ARN`: Bedrock model ARN
- `PORT`: Server port (default: 3000)