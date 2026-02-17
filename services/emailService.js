const nodemailer = require("nodemailer");

/**
 * Invia l'email di benvenuto con il PDF in allegato.
 * Il link nel corpo mail ora punta alla home per evitare ridondanza col PDF allegato.
 */
const sendWelcomePDF = async (userEmail, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .button:hover { background-color: #3a4d1a !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0 30px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc; background-color: #ffffff;">
              <tr>
                <td align="center" bgcolor="#4a5d23" style="padding: 40px 0 30px 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: 'Georgia', serif;">
                  PROMONTOLIO
                  <div style="font-size: 14px; font-weight: normal; font-style: italic; color: #d4af37; margin-top: 5px;">
                    Bio-Olivenöl aus dem Gargano
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 40px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #153643; font-family: 'Georgia', serif; font-size: 24px;">
                        <b>Ein Geschenk aus dem Gargano 🌿</b>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px;">
                        Vielen Dank für Ihr Interesse an Promontolio. 
                        <br><br>
                        Wie versprochen, finden Sie **im Anhang dieser E-Mail** Ihren exklusiven Guide über das "flüssige Gold" Apuliens. Wir haben ihn direkt beigefügt, damit Sie ihn jederzeit offline lesen können. 
                        Entdecken Sie die Erntegeheimnisse des Gargano sowie köstliche Rezepte unserer Tradition.
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding: 10px 0 0 0;">
                              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Möchten Sie mehr über unser Projekt erfahren?</p>
                              <a href="https://www.giuseppemancini.dev" target="_blank" style="background-color: #4a5d23; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;" class="button">
                                UNSERE PHILOSOPHIE
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td bgcolor="#f9f9f9" style="padding: 30px 30px 30px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #999999; font-family: Arial, sans-serif; font-size: 12px; width: 75%;">
                        &copy; 2026 Promontolio, Frankfurt am Main<br/>
                        Sie erhalten diese E-Mail, weil Sie den Guide auf promontolio.it angefordert haben.
                      </td>
                      <td align="right" style="width: 25%;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                              <a href="https://www.giuseppemancini.dev" style="color: #4a5d23; text-decoration: none;">Website</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Promontolio" <giuseppe.mancini80@gmail.com>',
    to: userEmail,
    subject: "Ihr PDF-Guide: Entdecken Sie das Gold des Gargano 🌿",
    html: htmlContent,
    attachments: [
      {
        filename: "Promontolio_Guide_2026.pdf",
        path: pdfPath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomePDF };
