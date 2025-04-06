-- CreateTable
CREATE TABLE "EnergyBill" (
    "id" SERIAL NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "referenceMonthCode" TEXT NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "referenceMonth" INTEGER NOT NULL,
    "energyElectricKwh" DOUBLE PRECISION NOT NULL,
    "energyElectricValue" DOUBLE PRECISION NOT NULL,
    "energySceeKwh" DOUBLE PRECISION,
    "energySceeValue" DOUBLE PRECISION,
    "energyCompensatedKwh" DOUBLE PRECISION NOT NULL,
    "energyCompensatedValue" DOUBLE PRECISION NOT NULL,
    "publicLightingContribution" DOUBLE PRECISION NOT NULL,
    "totalEnergyConsumption" DOUBLE PRECISION NOT NULL,
    "totalValueWithoutGD" DOUBLE PRECISION NOT NULL,
    "gdSavings" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyBill_clientNumber_key" ON "EnergyBill"("clientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EnergyBill_referenceMonthCode_key" ON "EnergyBill"("referenceMonthCode");

-- CreateIndex
CREATE INDEX "EnergyBill_clientNumber_idx" ON "EnergyBill"("clientNumber");

-- CreateIndex
CREATE INDEX "EnergyBill_referenceYear_idx" ON "EnergyBill"("referenceYear");

-- CreateIndex
CREATE INDEX "EnergyBill_referenceMonth_idx" ON "EnergyBill"("referenceMonth");
