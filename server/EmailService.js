import nodemailer from 'nodemailer';
import { HTTP_URL } from '../src/shared/hosts';
import emailCredentials from './email-credentials.json';

var transport = nodemailer.createTransport({
    service: 'Yandex',
    auth: {
        ...emailCredentials,
    }
});

const sendConfirmationEmail = (email, login, token) => new Promise((resolve, reject) => {
    const link = `${HTTP_URL}/confirmEmail?confirmationToken=${token}`;

    const mailOptions = {
        to: email,
        from: 'noreply-filestorage@yandex.by',
        subject : 'Welcome to FileStorage! Please confirm your email account to access the service',
        html: `
            Hello, ${login}!<br>
            Please click <a href="${link}">here</a> to confirm your email.<br>
        `,
    }

    transport.sendMail(mailOptions, (error, response) => {
        if (error) return reject(error);
        resolve(response);
    });
});

export default {
    sendConfirmationEmail,
}