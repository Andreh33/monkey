-- CreateTable
CREATE TABLE "ScooterRegistrationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holderName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "noCertificate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScooterRegistrationDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScooterRegistrationDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ScooterRegistrationRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScooterRegistrationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "stripePaymentUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ScooterRegistrationDocument_requestId_idx" ON "ScooterRegistrationDocument"("requestId");
