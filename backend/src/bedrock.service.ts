import { Injectable } from '@nestjs/common';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime';

@Injectable()
export class BedrockService {
  private client: BedrockAgentRuntimeClient;
  private knowledgeBaseId: string;

  constructor() {
    this.client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_DEFAULT_REGION || 'us-west-2',
      credentials: {
        accessKeyId: "",
        secretAccessKey: "",
        sessionToken: "",
      },
    });
    this.knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID || '';
  }

  async queryBedrock(question: string): Promise<string> {
    try {
      const command = new RetrieveAndGenerateCommand({
        input: {
          text: question
        },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: this.knowledgeBaseId,
            modelArn: 'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0'
          }
        }
      });

      const response = await this.client.send(command);
      return response.output?.text || 'No response generated';
    } catch (error) {
      console.error('Bedrock query error:', error);
      return 'Information not found in knowledge base. Please try rephrasing your question or contact support for assistance.';
    }
  }
}