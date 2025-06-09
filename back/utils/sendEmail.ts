import nodemailer from 'nodemailer';
import { env } from 'node:process';
import { stringData } from './formatDate';


export function sendEmail(email: string, text: string, texthtml: string, type: string) {
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"LabHub Reservas" <${env.EMAIL_USER}>`,
        to: email,
        subject: `LabHub - ${type}`,
        text: text,
        ... (texthtml && {
            html: texthtml
        })
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Não foi possível enviar o email');
        }
    });

    return;
}