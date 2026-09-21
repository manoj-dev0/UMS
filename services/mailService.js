const transporter = require('../data/connection/mailerConnection');
const fs = require('fs');
const path = require('path');

const sendVerificationEmail = async (email, name, verificationToken) => {
    let html = fs.readFileSync(
        path.join(
            __dirname,
            '../templates/emailVerification.html'
        ),
        'utf8'
    );

    const verificationUrl =
        `${process.env.BACKEND_URL}/verify-email?token=${verificationToken}`;

    html = html
        .replace(/{{firstName}}/g, name)
        .replace(/{{verificationUrl}}/g, verificationUrl);

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify your UMS email address',
        html
    });
};

const sendPasswordResetEmail = async (email, name, verificationToken) => {
    let html = fs.readFileSync(
        path.join(
            __dirname,
            '../templates/resetPassword.html'
        ),
        'utf8'
    );

    const verificationUrl =
        `${process.env.BACKEND_URL}/resetPassword?token=${verificationToken}`;

    html = html
        .replace(/{{firstName}}/g, name)
        .replace(/{{resetUrl}}/g, verificationUrl);

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset your UMS password',
        html
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};