/*
  Warnings:

  - You are about to drop the column `duracao` on the `reserva` table. All the data in the column will be lost.
  - You are about to drop the column `idRes` on the `reserva` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "dia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME NOT NULL,
    "duracao" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    CONSTRAINT "dia_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reserva" ("data_fim", "data_inicio", "id", "laboratorio_id", "tipo", "user_id") SELECT "data_fim", "data_inicio", "id", "laboratorio_id", "tipo", "user_id" FROM "reserva";
DROP TABLE "reserva";
ALTER TABLE "new_reserva" RENAME TO "reserva";
PRAGMA foreign_key_check("reserva");
PRAGMA foreign_keys=ON;
