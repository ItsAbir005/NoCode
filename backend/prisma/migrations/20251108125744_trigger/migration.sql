/*
  Warnings:

  - You are about to drop the column `description` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "description",
ADD COLUMN     "actions" JSONB,
ADD COLUMN     "trigger" JSONB;
