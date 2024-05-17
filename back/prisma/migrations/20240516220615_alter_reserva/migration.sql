/*
  Warnings:

  - Made the column `data_fim` on table `reserva` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME NOT NULL,
    "hora_inicio" TEXT,
    "duracao" TEXT,
    "tipo" TEXT NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reserva" ("data_fim", "data_inicio", "duracao", "hora_inicio", "id", "laboratorio_id", "tipo", "user_id") SELECT "data_fim", "data_inicio", "duracao", "hora_inicio", "id", "laboratorio_id", "tipo", "user_id" FROM "reserva";
DROP TABLE "reserva";
ALTER TABLE "new_reserva" RENAME TO "reserva";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
