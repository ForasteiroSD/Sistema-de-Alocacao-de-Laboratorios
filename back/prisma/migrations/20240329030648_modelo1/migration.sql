-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "data_nasc" DATETIME NOT NULL,
    "telefone" TEXT NOT NULL,
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "laboratorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "projetor" INTEGER,
    "quadro" INTEGER,
    "televisao" INTEGER,
    "ar_contidionado" INTEGER,
    "outro" TEXT,
    "responsavel_id" TEXT NOT NULL,
    CONSTRAINT "laboratorio_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME,
    "hora_inicio" TEXT,
    "hora_fim" TEXT,
    "tipo" TEXT NOT NULL,
    "laboratorio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "reserva_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reserva_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "horarios_reservas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia_semana" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fim" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    CONSTRAINT "horarios_reservas_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "user"("cpf");
