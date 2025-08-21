import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

export class TranscribeService {
  private transcribeClient: TranscribeClient;
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const credentials: any = {};
    if (process.env.AWS_ACCESS_KEY_ID) credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    if (process.env.AWS_SECRET_ACCESS_KEY) credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (process.env.AWS_SESSION_TOKEN) credentials.sessionToken = process.env.AWS_SESSION_TOKEN;

    const config = {
      region: process.env.AWS_REGION || 'us-west-2',
      ...(Object.keys(credentials).length > 0 && { credentials })
    };

    this.transcribeClient = new TranscribeClient(config);
    this.s3Client = new S3Client(config);
    this.bucketName = process.env.S3_BUCKET || 'genai-transcribe-temp';
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    const key = `audio-${Date.now()}.wav`;
    const jobName = `job-${Date.now()}`;

    try {
      // Upload to S3
      const audioBuffer = readFileSync(audioPath);
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: audioBuffer,
        ContentType: 'audio/wav'
      }));

      // Start transcription
      await this.transcribeClient.send(new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        Media: { MediaFileUri: `s3://${this.bucketName}/${key}` },
        MediaFormat: 'wav',
        LanguageCode: 'es-ES'
      }));

      // Poll for completion
      let attempts = 0;
      while (attempts < 30) {
        const result = await this.transcribeClient.send(new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName
        }));

        if (result.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
          const transcriptUri = result.TranscriptionJob.Transcript?.TranscriptFileUri;
          if (transcriptUri) {
            const response = await fetch(transcriptUri);
            const transcript = await response.json();
            return transcript.results.transcripts[0].transcript;
          }
        }

        if (result.TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
          throw new Error('Transcription failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new Error('Transcription timeout');
    } finally {
      // Cleanup S3 object
      try {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key
        }));
      } catch (e) {
        console.warn('Failed to cleanup S3 object:', e);
      }
    }
  }
}