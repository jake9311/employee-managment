const { sendEmail } = require("./sendEmail");

async function runTest() {
  await sendEmail(
    "ymakoria@gmail.com",
    "Test SMTP",
    "זה מייל בדיקה מ-Brevo SMTP"
  );
}

runTest();
