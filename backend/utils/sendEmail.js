require ('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


async function sendEmail(to, subject, text) {
    if (!to) {
        throw new Error('Email address is required');
    }   
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
        console.error(error.message|| error);
        }
    }

}

module.exports = {sendEmail};
