-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_horarios_reservas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia_semana" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fim" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    CONSTRAINT "horarios_reservas_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_horarios_reservas" ("dia_semana", "hora_fim", "hora_inicio", "id", "reserva_id") SELECT "dia_semana", "hora_fim", "hora_inicio", "id", "reserva_id" FROM "horarios_reservas";
DROP TABLE "horarios_reservas";
ALTER TABLE "new_horarios_reservas" RENAME TO "horarios_reservas";
CREATE TABLE "new_reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME,
    "hora_inicio" TEXT,
    "hora_fim" TEXT,
    "tipo" TEXT NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reserva" ("data_fim", "data_inicio", "hora_fim", "hora_inicio", "id", "laboratorio_id", "tipo", "user_id") SELECT "data_fim", "data_inicio", "hora_fim", "hora_inicio", "id", "laboratorio_id", "tipo", "user_id" FROM "reserva";
DROP TABLE "reserva";
ALTER TABLE "new_reserva" RENAME TO "reserva";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
