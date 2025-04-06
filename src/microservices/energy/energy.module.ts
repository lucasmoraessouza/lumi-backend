import { Module } from '@nestjs/common';
import { EnergyController } from './energy.controller';
import { EnergyService } from './energy.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EnergyController],
  providers: [EnergyService, PrismaService],
})
export class EnergyModule {}