/*
  Warnings:

  - You are about to drop the column `ar_contidionado` on the `laboratorio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "laboratorio" DROP COLUMN "ar_contidionado",
ADD COLUMN     "ar_condicionado" INTEGER;
