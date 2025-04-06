/*
  Warnings:

  - You are about to drop the column `clientNumber` on the `EnergyBill` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId,referenceMonthCode]` on the table `EnergyBill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `EnergyBill` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EnergyBill_clientNumber_idx";

-- DropIndex
DROP INDEX "EnergyBill_clientNumber_key";

-- DropIndex
DROP INDEX "EnergyBill_referenceMonthCode_key";

-- AlterTable
ALTER TABLE "EnergyBill" DROP COLUMN "clientNumber",
ADD COLUMN     "clientId" INTEGER NOT NULL,
ALTER COLUMN "energyElectricKwh" SET DEFAULT 0,
ALTER COLUMN "energyElectricValue" SET DEFAULT 0,
ALTER COLUMN "energySceeKwh" SET DEFAULT 0,
ALTER COLUMN "energySceeValue" SET DEFAULT 0,
ALTER COLUMN "energyCompensatedKwh" SET DEFAULT 0,
ALTER COLUMN "energyCompensatedValue" SET DEFAULT 0,
ALTER COLUMN "publicLightingContribution" SET DEFAULT 0,
ALTER COLUMN "totalEnergyConsumption" SET DEFAULT 0,
ALTER COLUMN "totalValueWithoutGD" SET DEFAULT 0,
ALTER COLUMN "gdSavings" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientNumber_key" ON "Client"("clientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyBill_clientId_referenceMonthCode_key" ON "EnergyBill"("clientId", "referenceMonthCode");

-- AddForeignKey
ALTER TABLE "EnergyBill" ADD CONSTRAINT "EnergyBill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
