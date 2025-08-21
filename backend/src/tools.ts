import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<string>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private agentClient: BedrockAgentRuntimeClient;

  constructor() {
    this.agentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION || 'us-west-2' });
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.registerTool({
      name: 'search_knowledge_base',
      description: 'Search telecom FAQ knowledge base for specific information about plans, billing, technical issues, service coverage, pricing, account management, or troubleshooting. Use specific keywords related to the user question.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Specific search terms related to telecom services (e.g., "data plan pricing", "network coverage", "billing issues", "technical support")' }
        },
        required: ['query']
      },
      execute: this.searchKnowledgeBase.bind(this)
    });

    this.registerTool({
      name: 'get_current_time',
      description: 'Get the current date and time when user asks for time, date, or current timestamp',
      parameters: { type: 'object', properties: {} },
      execute: this.getCurrentTime.bind(this)
    });
  }

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, params: any): Promise<string> {
    const startTime = Date.now();
    console.log(`Executing tool: ${name}`);
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    const result = await tool.execute(params);
    const executionTime = Date.now() - startTime;
    console.log(`Tool ${name} completed in ${executionTime}ms`);
    return result;
  }

  private async searchKnowledgeBase(params: { query: string }): Promise<string> {
    const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
    if (!knowledgeBaseId) return 'Knowledge base not configured';

    try {
      const command = new RetrieveCommand({
        knowledgeBaseId,
        retrievalQuery: { text: params.query },
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 3
          }
        }
      });

      const response = await this.agentClient.send(command);
      const results = response.retrievalResults || [];
      
      if (results.length === 0) return 'No relevant information found in knowledge base';
      
      return results
        .map((r, i) => `[Result ${i + 1}]\n${r.content?.text}`)
        .filter(Boolean)
        .join('\n\n---\n\n');
    } catch (error: any) {
      if (error.name === 'ServiceUnavailableException') {
        return 'Knowledge base temporarily unavailable. Please try again later.';
      }
      throw error;
    }
  }

  private async getCurrentTime(): Promise<string> {
    const now = new Date();
    return `Current date and time: ${now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })}`;
  }
}