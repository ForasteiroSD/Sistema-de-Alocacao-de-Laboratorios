/*
  Warnings:

  - Changed the type of `tipo` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "USER_TYPE" AS ENUM ('Responsável', 'Administrador', 'Usuário');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "USER_TYPE" NOT NULL;
