import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as pdfParse from 'pdf-parse';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReadFileService {
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService) {
    this.uploadDir = join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    try {
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      throw new Error('Failed to initialize upload directory');
    }
  }

  async processPdf(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new Error('No file or file buffer provided');
    }

    try {
      const pdfData = await pdfParse(file.buffer);
      const text = pdfData.text.replace(/\s+/g, ' ');
      const extractedData = this.extractData(text);
      await this.saveToDatabase(extractedData, file);
      return {
        data: extractedData,
      };
    } catch (error) {
      throw new Error('Failed to process PDF file');
    }
  }

  private getSafeFileName(accountNumber: string, monthCode: string): string {
    return `${accountNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${monthCode.replace(
      /[^a-zA-Z0-9]/g,
      '_',
    )}.pdf`;
  }

  async saveToDatabase(data: any, file: Express.Multer.File) {
    if (!data.referenceMonth || !data.accountNumber) {
      throw new Error(
        'Missing required fields: referenceMonth or accountNumber',
      );
    }

    const { monthCode, year, month } = this.parseReferenceMonth(
      data.referenceMonth,
    );
    const fileName = this.getSafeFileName(
      data.accountNumber.toString(),
      monthCode,
    );
    const filePath = join(this.uploadDir, fileName);

    try {
      writeFileSync(filePath, file.buffer);
    } catch (error) {
      throw new Error(`File save failed: ${error.message}`);
    }

    const existingInvoice = await this.prisma.energyBill.findFirst({
      where: {
        client: {
          clientNumber: data.accountNumber.toString(),
        },
        referenceMonthCode: monthCode,
        referenceYear: year,
      },
    });

    if (existingInvoice) {
      throw new ConflictException(
        `Invoice already exists for client ${data.accountNumber} and period ${monthCode}`,
      );
    }

    const client = await this.prisma.client.upsert({
      where: { clientNumber: data.accountNumber.toString() },
      create: { clientNumber: data.accountNumber.toString() },
      update: {},
    });

    return this.prisma.energyBill.create({
      data: {
        clientId: client.id,
        referenceMonthCode: monthCode,
        referenceYear: year,
        referenceMonth: month,
        energyElectricKwh: data.energyElectric?.quantity || 0,
        energyElectricValue: data.energyElectric?.value || 0,
        energySceeKwh: data.energySCEE?.quantity || 0,
        energySceeValue: data.energySCEE?.value || 0,
        energyCompensatedKwh: data.energyCompensatedGDI?.quantity || 0,
        energyCompensatedValue: data.energyCompensatedGDI?.value || 0,
        publicLightingContribution: data.publicLightingContribution || 0,
        totalEnergyConsumption:
          data.calculatedValues?.totalEnergyConsumption || 0,
        totalValueWithoutGD: data.calculatedValues?.totalValueWithoutGD || 0,
        gdSavings: data.calculatedValues?.gdSavings || 0,
        pdfOriginal: file.buffer,
        pdfFileName: fileName,
      },
    });
  }

  async getPdfFile(id: number) {
    const bill = await this.prisma.energyBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new NotFoundException('Invoice not found');
    }

    if (!bill.pdfOriginal || !bill.pdfFileName) {
      throw new NotFoundException('PDF file not found for this invoice');
    }

    return {
      buffer: bill.pdfOriginal,
      fileName: bill.pdfFileName,
    };
  }

  private parseReferenceMonth(refMonth: string) {
    const [monthStr, yearStr] = refMonth.split('/');
    const year = parseInt(yearStr);

    const monthMap: Record<string, number> = {
      JAN: 1,
      FEV: 2,
      MAR: 3,
      ABR: 4,
      MAI: 5,
      JUN: 6,
      JUL: 7,
      AGO: 8,
      SET: 9,
      OUT: 10,
      NOV: 11,
      DEZ: 12,
    };

    if (!monthMap[monthStr]) {
      throw new Error(`Invalid month reference: ${monthStr}`);
    }

    return {
      monthCode: refMonth,
      year,
      month: monthMap[monthStr],
    };
  }

  private extractData(text: string) {
    const clientInstallationMatch = text.match(
      /Nº DO CLIENTE\s*Nº DA INSTALAÇÃO\s*(\d{10})\s*(\d{10})/,
    );
    const referenceMonthMatch =
      text.match(/Referente a\s+([A-Z]{3}\/\d{4})/i) ||
      text.match(/MÊS\/ANO.*?([A-Z]{3}\/\d{4})/);
    const energyElectricMatch = text.match(
      /Energia El[ée]trica.*?kWh\s+(\d+)\s+[\d,.]+\s+([\d,.]+)/i,
    );
    const energySCEEMatch = text.match(
      /Energia SCEE s?\/? ICMS.*?kWh\s+([\d.]+)\s+[\d,.]+\s+([\d,.]+)/i,
    );
    const energyGDICompMatch = text.match(
      /Energia compensada GD I.*?kWh\s+([\d.]+)\s+[\d,.]+\s+(-?[\d,.]+)/i,
    );
    const publicLightingMatch = text.match(
      /Contrib Ilum Publica Municipal\s+([\d,.]+)/i,
    );

    return {
      accountNumber:
        (clientInstallationMatch && Number(clientInstallationMatch[1])) || null,
      referenceMonth: referenceMonthMatch?.[1] || null,
      energyElectric: energyElectricMatch
        ? {
            quantity: parseInt(energyElectricMatch[1].replace(/\./g, '')),
            value: this.parseCurrency(energyElectricMatch[2]),
          }
        : { quantity: 0, value: 0 },
      energySCEE: energySCEEMatch
        ? {
            quantity: parseInt(energySCEEMatch[1].replace(/\./g, '')),
            value: this.parseCurrency(energySCEEMatch[2]),
          }
        : null,
      energyCompensatedGDI: energyGDICompMatch
        ? {
            quantity: parseInt(energyGDICompMatch[1].replace(/\./g, '')),
            value: this.parseCurrency(energyGDICompMatch[2]),
          }
        : { quantity: 0, value: 0 },
      publicLightingContribution: publicLightingMatch
        ? this.parseCurrency(publicLightingMatch[1])
        : 0,
      calculatedValues: {
        totalEnergyConsumption:
          (energyElectricMatch
            ? parseInt(energyElectricMatch[1].replace(/\./g, ''))
            : 0) +
          (energySCEEMatch
            ? parseInt(energySCEEMatch[1].replace(/\./g, ''))
            : 0),
        totalValueWithoutGD:
          (energyElectricMatch
            ? this.parseCurrency(energyElectricMatch[2])
            : 0) +
          (energySCEEMatch ? this.parseCurrency(energySCEEMatch[2]) : 0) +
          (publicLightingMatch
            ? this.parseCurrency(publicLightingMatch[1])
            : 0),
        gdSavings: energyGDICompMatch
          ? -this.parseCurrency(energyGDICompMatch[2])
          : 0,
      },
    };
  }

  private parseCurrency(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }
}
