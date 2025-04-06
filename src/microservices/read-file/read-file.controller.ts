import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ReadFileService } from './read-file.service';

@Controller('energy-bill')
export class ReadFileController {
  constructor(private readonly readFileService: ReadFileService) {}

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }
    return this.readFileService.processPdf(file);
  }

  @Get(':id/download')
  @HttpCode(200)
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const { buffer, fileName } = await this.readFileService.getPdfFile(
        Number(id),
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.send(buffer);
    } catch (error) {
      res.status(404).json({
        statusCode: 404,
        message: error.message || 'PDF não encontrado',
      });
    }
  }
}
