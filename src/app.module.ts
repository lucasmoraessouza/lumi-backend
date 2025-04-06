import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { envSchema } from 'env';
import { PrismaService } from './prisma/prisma.service';
import { EnergyModule } from './microservices/energy/energy.module';
import { InvoicesModule } from './microservices/invoices/invoices.module';
import { ReadFileController } from './microservices/read-file/read-file.controller';
import { ReadFileService } from './microservices/read-file/read-file.service';
@Module({
  imports: [
    EnergyModule, InvoicesModule,
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
  ],
  controllers: [ReadFileController],
  providers: [PrismaService, ReadFileService],
})
export class AppModule {}
