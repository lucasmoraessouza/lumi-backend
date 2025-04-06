import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnergyService {
  constructor(private prisma: PrismaService) {}

  private buildWhereClause(clientNumber?: string, year?: string) {
    const where: any = {};

    if (clientNumber) {
      where.client = {
        clientNumber: clientNumber,
      };
    }

    if (year && !isNaN(Number(year))) {
      where.referenceYear = Number(year);
    }

    return where;
  }

  async getSummary(clientNumber?: string, year?: string) {
    const where = this.buildWhereClause(clientNumber, year);

    const result = await this.prisma.energyBill.groupBy({
      by: ['referenceYear'],
      where,
      _sum: {
        energyElectricKwh: true,
        energyCompensatedKwh: true,
        totalValueWithoutGD: true,
        gdSavings: true,
      },
      orderBy: {
        referenceYear: 'asc',
      },
    });

    return {
      data: result[0],
    };
  }

  async getEnergyResults(
    clientNumber?: string,
    year?: string,
    referenceMonthCode?: string,
  ) {
    const where = {
      ...(clientNumber && {
        client: {
          clientNumber: clientNumber,
        },
      }),
      ...(year &&
        !isNaN(Number(year)) && {
          referenceYear: Number(year),
        }),
      ...(referenceMonthCode && {
        referenceMonthCode: referenceMonthCode,
      }),
    };

    const data = await this.prisma.energyBill.findMany({
      where,
      select: {
        referenceMonthCode: true,
        referenceYear: true,
        energyElectricKwh: true,
        energyCompensatedKwh: true,
        totalValueWithoutGD: true,
        gdSavings: true,
        client: {
          select: {
            clientNumber: true,
          },
        },
      },
      orderBy: [{ referenceYear: 'asc' }, { referenceMonth: 'asc' }],
    });

    return data.map((item) => ({
      period: item.referenceMonthCode,
      year: item.referenceYear,
      clientNumber: item.client.clientNumber,
      energyResults: {
        electricKwh: item.energyElectricKwh,
        compensatedKwh: item.energyCompensatedKwh,
        netConsumption:
          item.energyElectricKwh - (item.energyCompensatedKwh || 0),
      },
      financialResults: {
        totalWithoutGD: item.totalValueWithoutGD,
        gdSavings: item.gdSavings,
        netValue: item.totalValueWithoutGD - item.gdSavings,
      },
    }));
  }
}
