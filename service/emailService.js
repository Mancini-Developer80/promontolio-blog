const nodemailer = require("nodemailer");

const sendWelcomePDF = async (userEmail, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // O il tuo provider SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Promontolio" <info@promontolio.it>',
    to: userEmail,
    subject: "Il tuo PDF: Alla scoperta dell’oro del Gargano",
    text: "Grazie per esserti iscritto! In allegato trovi il nostro PDF.",
    attachments: [
      {
        filename: "Guida-Promontolio.pdf",
        path: pdfPath, // Percorso sul server o URL
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};
