const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // Create a transporter.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD
        }
    })
    // Define the email options.
    const mailOptions = {
        name: 'Dark youknowme@whoiam.com',
        to: options.email,
        subject: options.subject,
        text: options.msg
    }
    // Actually send the mail.
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;