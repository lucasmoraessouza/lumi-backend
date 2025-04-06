/*
  Warnings:

  - A unique constraint covering the columns `[pdfFileName]` on the table `EnergyBill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EnergyBill" ADD COLUMN     "pdfFileName" TEXT,
ADD COLUMN     "pdfOriginal" BYTEA;

-- CreateIndex
CREATE UNIQUE INDEX "EnergyBill_pdfFileName_key" ON "EnergyBill"("pdfFileName");
