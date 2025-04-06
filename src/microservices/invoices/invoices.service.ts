import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async listInvoices(clientNumber?: string, year?: string) {
    const where: any = {};

    if (clientNumber) {
      where.client = {
        clientNumber: clientNumber,
      };
    }

    if (year) {
      where.referenceYear = Number(year);
    }

    const invoices = await this.prisma.energyBill.findMany({
      where,
      select: {
        id: true,
        referenceMonthCode: true,
        referenceYear: true,
        createdAt: true,
        client: {
          select: {
            clientNumber: true,
          },
        },
      },
      orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
    });

    const availableClients = await this.prisma.client.findMany({
      select: {
        clientNumber: true,
      },
      distinct: ['clientNumber'],
      orderBy: {
        clientNumber: 'asc',
      },
    });

    const availableYears = await this.prisma.energyBill.findMany({
      select: {
        referenceYear: true,
      },
      distinct: ['referenceYear'],
      orderBy: {
        referenceYear: 'desc',
      },
    });

    return {
      data: invoices,
      filters: {
        clientNumbers: availableClients.map((c) => c.clientNumber),
        years: availableYears.map((y) => y.referenceYear.toString()),
      },
    };
  }

  async generateInvoicePdf(clientNumber: string, monthCode: string) {
    const invoice = await this.prisma.energyBill.findFirst({
      where: {
        client: {
          clientNumber: clientNumber,
        },
        referenceMonthCode: monthCode,
      },
      include: {
        client: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada.');
    }

    return this.createPdfFromInvoice(invoice);
  }

  private async createPdfFromInvoice(invoice: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    page.drawText(`Fatura ${invoice.referenceMonthCode}`, {
      x: 50,
      y: 700,
      size: 20,
    });

    page.drawText(`Cliente: ${invoice.client.clientNumber}`, {
      x: 50,
      y: 650,
      size: 12,
    });

    return Buffer.from(await pdfDoc.save());
  }
}
