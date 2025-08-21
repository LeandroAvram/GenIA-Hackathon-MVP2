import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('api')
export class AudioController {
  @Post('audio')
  @UseInterceptors(FileInterceptor('audio', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `audio_${timestamp}.wav`);
      },
    }),
  }))
  uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió archivo de audio');
    }
    
    console.log('Audio recibido:', file.filename);
    console.log('Tamaño:', file.size, 'bytes');
    
    return {
      message: 'Audio guardado exitosamente',
      filename: file.filename,
      size: file.size
    };
  }
}