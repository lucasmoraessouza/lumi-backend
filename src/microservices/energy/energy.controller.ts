import { Controller, Get, Query } from '@nestjs/common';
import { EnergyService } from './energy.service';

@Controller('energy')
export class EnergyController {
  constructor(private readonly energyService: EnergyService) {}

  @Get('summary')
  async getSummary(
    @Query('clientNumber') clientNumber?: string,
    @Query('year') year?: string,
  ) {
    return this.energyService.getSummary(clientNumber, year);
  }

  @Get('results')
  async getEnergyResults(
    @Query('clientNumber') clientNumber?: string,
    @Query('year') year?: string,
    @Query('referenceMonthCode') referenceMonthCode?: string,
  ) {
    return this.energyService.getEnergyResults(
      clientNumber,
      year,
      referenceMonthCode,
    );
  }
}
