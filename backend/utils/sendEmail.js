require ('dotenv').config();
const sgMail = require('@sendgrid/mail');
const e = require('express');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


async function sendEmail(to, subject, text) {
    const msg = {
        to ,
        from: process.env.FROM_EMAIL,
        subject,
        text,
    };
    try{
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    }catch(error){
        if (error.response&&error.response.body&& error.response.body.errors) {
            console.error(error.response.body.errors);
        }
        else{
        // console.log('Error sending email', error.response?.body)|| error.message|| error;
        console.error(error.message|| error);
        }
    }

}

module.exports = {sendEmail};
