/*
  Warnings:

  - You are about to drop the `horarios_reservas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `hora_inicio` on the `reserva` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `reserva` table. All the data in the column will be lost.
  - Added the required column `idRes` to the `reserva` table without a default value. This is not possible if the table is not empty.
  - Made the column `duracao` on table `reserva` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "horarios_reservas";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME NOT NULL,
    "duracao" TEXT NOT NULL,
    "idRes" INTEGER NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reserva" ("data_fim", "data_inicio", "duracao", "id", "laboratorio_id", "user_id") SELECT "data_fim", "data_inicio", "duracao", "id", "laboratorio_id", "user_id" FROM "reserva";
DROP TABLE "reserva";
ALTER TABLE "new_reserva" RENAME TO "reserva";
PRAGMA foreign_key_check("reserva");
PRAGMA foreign_keys=ON;
