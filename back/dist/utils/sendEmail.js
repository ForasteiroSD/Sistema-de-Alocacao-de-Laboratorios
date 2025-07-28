"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReserveEmailText = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const formatDate_1 = require("./formatDate");
const env_1 = require("./env");
function sendEmail(email, text, texthtml, type) {
    const transport = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: env_1.env.EMAIL_USER,
            pass: env_1.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const mailOptions = Object.assign({ from: `"LabHub Reservas" <${env_1.env.EMAIL_USER}>`, to: email, subject: `LabHub - ${type}`, text: text }, (texthtml && {
        html: texthtml
    }));
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Não foi possível enviar o email');
        }
    });
    return;
}
exports.sendEmail = sendEmail;
function createReserveEmailText(tipo, labName, userName, data_inicio, data_fim, hora_inicio, duracao, horarios, email) {
    let text1 = `Nova reserva ${tipo} feita no laboratório ${labName}\n\nDados da Reserva:\nUsuário: ${userName}\n`;
    let text2 = `<h1>Nova reserva ${tipo} feita no laboratório ${labName}</h1><h3>Dados da Reserva:</h3><p style='margin: 0'>Usuário: ${userName}</p>`;
    if (tipo === 'Única') {
        text1 += `Data: ${data_inicio}\nHorário: ${hora_inicio}\nDuração: ${duracao}\n\n`;
        text2 += `<div><p style='margin: 0'>Data: ${data_inicio}</p><p style='margin: 0'>Horário: ${hora_inicio}</p><p style='margin: 0'>Duração: ${duracao}</p></div>`;
    }
    else if (tipo === 'Personalizada') {
        for (const dia of horarios) {
            text1 += `Data: ${(0, formatDate_1.stringData)(dia.data, false)}\nHorário: ${dia.hora_inicio}\nDuração: ${dia.duracao}\n\n`;
            text2 += `<div><p style='margin: 0'>Data: ${(0, formatDate_1.stringData)(dia.data, false)}</p><p style='margin: 0'>Horário: ${dia.hora_inicio}</p><p style='margin: 0'>Duração: ${dia.duracao}</p></div><br>`;
        }
    }
    else if (tipo === 'Semanal') {
        text1 += `Data Inicial: ${data_inicio}\nData Final: ${data_fim}\n\n`;
        text2 += `<div><p style='margin: 0'>Data Inicial: ${data_inicio}</p><p style='margin: 0'>Data Final: ${data_fim}</p><br>`;
        for (const dia of horarios) {
            text1 += `Dia da semana: ${dia.dia_semana}\nHorário: ${dia.hora_inicio}\nDuração: ${dia.duracao}\n\n`;
            text2 += `<div><p style='margin: 0'>Dia da semana: ${dia.dia_semana}</p><p style='margin: 0'>Horário: ${dia.hora_inicio}</p><p style='margin: 0'>Duração: ${dia.duracao}</p></div><br>`;
        }
        text2 += '</div>';
    }
    else {
        text1 += `Data Inicial: ${data_inicio}\nData Final: ${data_fim}\nHorário: ${hora_inicio}\nDuração: ${duracao}\n\n`;
        text2 += `<p style='margin: 0'>Data Inicial: ${data_inicio}</p><p style='margin: 0'>Data Final: ${data_fim}</p><p style='margin: 0'>Horário: ${hora_inicio}</p><p style='margin: 0'>Duração: ${duracao}</p><br>`;
    }
    text1 += `\nAcesse ${env_1.env.PAGE_LINK} para ver mais!\n\n\nLabHub - Alocação de Laboratórios`;
    text2 += `<br><br><p style='margin: 0'>Acesse <a href="${env_1.env.PAGE_LINK}">LabHub</a> para ver mais!</p><br><br>LabHub - Alocação de Laboratórios`;
    sendEmail(email, text1, text2, 'Nova Reserva');
}
exports.createReserveEmailText = createReserveEmailText;
