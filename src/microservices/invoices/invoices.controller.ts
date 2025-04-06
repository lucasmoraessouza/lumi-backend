import { Controller, Get, Query, Param, Res, HttpCode } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @HttpCode(200)
  async listInvoices(@Query('clientNumber') clientNumber?: string) {
    return this.invoicesService.listInvoices(clientNumber);
  }

  @Get(':clientNumber/:monthCode')
  @HttpCode(200)
  async downloadInvoice(
    @Param('clientNumber') clientNumber: string,
    @Param('monthCode') monthCode: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.invoicesService.generateInvoicePdf(
      clientNumber,
      monthCode,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=fatura-${clientNumber}-${monthCode}.pdf`,
    );
    return res.send(pdfBuffer);
  }
}
