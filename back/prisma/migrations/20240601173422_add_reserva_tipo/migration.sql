/*
  Warnings:

  - Added the required column `tipo` to the `reserva` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME NOT NULL,
    "duracao" TEXT NOT NULL,
    "idRes" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reserva" ("data_fim", "data_inicio", "duracao", "id", "idRes", "laboratorio_id", "user_id") SELECT "data_fim", "data_inicio", "duracao", "id", "idRes", "laboratorio_id", "user_id" FROM "reserva";
DROP TABLE "reserva";
ALTER TABLE "new_reserva" RENAME TO "reserva";
PRAGMA foreign_key_check("reserva");
PRAGMA foreign_keys=ON;
