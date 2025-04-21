require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Configura SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = {
            to, // Correo del destinatario
            from: process.env.SENDGRID_FROM_EMAIL, // Correo del remitente
            subject, // Asunto del correo
            text, // Texto sin formato
            html, // Versión HTML del correo
        };

        await sgMail.send(msg);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        if (error.response) {
            console.error('Detalles del error:', error.response.body);
        }
        throw new Error('No se pudo enviar el correo.');
    }
};

module.exports = sendEmail;