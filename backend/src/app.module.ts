import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { AudioController } from './audio.controller';
import { BedrockService } from './bedrock.service';

@Module({
  controllers: [ChatController, AudioController],
  providers: [BedrockService],
})
export class AppModule {}