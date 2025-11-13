/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt",
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
