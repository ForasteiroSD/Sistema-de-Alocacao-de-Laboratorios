/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `laboratorio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "laboratorio_nome_key" ON "laboratorio"("nome");
