import nodemailer from 'nodemailer';
import { HTTP_URL } from '../src/shared/hosts';
import emailCredentials from './email-credentials.json';

var transport = nodemailer.createTransport({
    service: emailCredentials.service,
    auth: {
        user: emailCredentials.user,
        pass: emailCredentials.pass,
    }
});

const sendConfirmationEmail = (email, login, token) => new Promise((resolve, reject) => {
    const url = new URL('confirmEmail', HTTP_URL);
    url.searchParams.append('confirmationToken', token);

    const mailOptions = {
        to: email,
        from: emailCredentials.from,
        subject : 'Welcome to FileStorage! Please confirm your email account to access the service',
        html: `
            Hello, ${login}!<br>
            Please click <a href="${url.toString()}">here</a> to confirm your email.<br>
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