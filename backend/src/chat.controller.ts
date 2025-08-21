import { Controller, Post, Body } from '@nestjs/common';
import { BedrockService } from './bedrock.service';

@Controller('api')
export class ChatController {
  constructor(private readonly bedrockService: BedrockService) {}

  @Post('chat')
  async chat(@Body() body: { message: string }) {
    const { message } = body;
    
    try {
      const response = await this.bedrockService.queryBedrock(message);
      
      return { 
        response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        response: 'Lo siento, ocurrió un error procesando tu consulta. Intenta nuevamente.',
        timestamp: new Date().toISOString()
      };
    }
  }
}