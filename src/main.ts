import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3339);
  await app.listen(port);
  console.log(`application is running on port ${port}`);
}
bootstrap();
