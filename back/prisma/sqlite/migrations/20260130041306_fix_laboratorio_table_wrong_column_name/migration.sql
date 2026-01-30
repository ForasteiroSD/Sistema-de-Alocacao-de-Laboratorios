/*
  Warnings:

  - You are about to drop the column `ar_contidionado` on the `laboratorio` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_laboratorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "projetor" INTEGER,
    "quadro" INTEGER,
    "televisao" INTEGER,
    "ar_condicionado" INTEGER,
    "computador" INTEGER,
    "outro" TEXT,
    "responsavel_id" TEXT NOT NULL,
    CONSTRAINT "laboratorio_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_laboratorio" ("capacidade", "computador", "id", "nome", "outro", "projetor", "quadro", "responsavel_id", "televisao") SELECT "capacidade", "computador", "id", "nome", "outro", "projetor", "quadro", "responsavel_id", "televisao" FROM "laboratorio";
DROP TABLE "laboratorio";
ALTER TABLE "new_laboratorio" RENAME TO "laboratorio";
CREATE UNIQUE INDEX "laboratorio_nome_key" ON "laboratorio"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
