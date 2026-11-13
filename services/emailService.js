const nodemailer = require("nodemailer");
const fs = require("fs");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeHeader = (value) => String(value).replace(/[\r\n]/g, " ").trim();
const getEmailLocale = (locale) => (locale === "it" ? "it" : "de");
const EMAIL_TEXTS = {
  it: {
    guideBrand: "Olio extravergine di oliva del Gargano",
    confirmationSubject: "Conferma la richiesta della guida Promontolio",
    confirmationText: "Conferma la richiesta della guida",
    confirmationHtml:
      "Conferma la richiesta della guida Promontolio entro 24 ore:",
    confirmationLink: "Richiedi la guida",
    leadSubject: "Nuovo lead confermato",
    leadText: "Lead confermato",
    sourceLabel: "Origine",
    localeLabel: "Lingua",
    guideTitle: "Un regalo dal Gargano 🌿",
    guideThanks: "Grazie per il tuo interesse per Promontolio.",
    guideDescription:
      "Come promesso, trovi <strong>in allegato a questa email</strong> la guida esclusiva sull'oro liquido della Puglia. Puoi leggerla offline quando vuoi.",
    guideDetails:
      "Scopri i segreti della raccolta nel Gargano e le ricette della nostra tradizione.",
    guideMore: "Vuoi saperne di più sul nostro progetto?",
    guideButton: "La nostra filosofia",
    guideReason:
      "Ricevi questa email perché hai richiesto la guida su promontolio.it.",
    unsubscribe: "Revoca il consenso",
    website: "Sito web",
    contactSubject: "Nuovo messaggio da",
    contactTitle: "Nuova richiesta di contatto",
    contactName: "Nome",
    contactEmail: "Email",
    contactMessage: "Messaggio",
    contactFooter: "Inviato dal modulo contatti di promontolio.it",
  },
  de: {
    guideBrand: "Bio-Olivenöl aus dem Gargano",
    confirmationSubject: "Bestätigen Sie Ihre Promontolio-Guide-Anfrage",
    confirmationText: "Bestätigen Sie Ihre Guide-Anfrage",
    confirmationHtml:
      "Bestätigen Sie Ihre Promontolio-Guide-Anfrage innerhalb von 24 Stunden:",
    confirmationLink: "Guide anfordern",
    leadSubject: "Neuer bestätigter Lead",
    leadText: "Bestätigter Lead",
    sourceLabel: "Quelle",
    localeLabel: "Sprache",
    guideTitle: "Ein Geschenk aus dem Gargano 🌿",
    guideThanks: "Vielen Dank für Ihr Interesse an Promontolio.",
    guideDescription:
      "Wie versprochen, finden Sie <strong>im Anhang dieser E-Mail</strong> Ihren exklusiven Guide über das flüssige Gold Apuliens. Sie können ihn jederzeit offline lesen.",
    guideDetails:
      "Entdecken Sie die Erntegeheimnisse des Gargano sowie köstliche Rezepte unserer Tradition.",
    guideMore: "Möchten Sie mehr über unser Projekt erfahren?",
    guideButton: "Unsere Philosophie",
    guideReason:
      "Sie erhalten diese E-Mail, weil Sie den Guide auf promontolio.it angefordert haben.",
    unsubscribe: "Einwilligung widerrufen",
    website: "Website",
    contactSubject: "Neue Nachricht von",
    contactTitle: "Neue Kontaktanfrage",
    contactName: "Name",
    contactEmail: "E-Mail",
    contactMessage: "Nachricht",
    contactFooter: "Gesendet über das Kontaktformular von promontolio.it",
  },
};

const getEmailTexts = (locale) => EMAIL_TEXTS[getEmailLocale(locale)];

function assertEmailConfiguration() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured.");
  }
}

// 1. Configurazione unica del trasportatore
const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendLeadConfirmation = async (
  userEmail,
  confirmationUrl,
  locale = "de",
) => {
  assertEmailConfiguration();
  const texts = getEmailTexts(locale);
  return transporter.sendMail({
    from: `"Promontolio" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: texts.confirmationSubject,
    text: `${texts.confirmationText}: ${confirmationUrl}`,
    html: `
      <p>${texts.confirmationHtml}</p>
      <p><a href="${escapeHtml(confirmationUrl)}">${texts.confirmationLink}</a></p>
    `,
  });
};

const sendLeadNotification = async (email, source, locale = "de") => {
  assertEmailConfiguration();
  const texts = getEmailTexts(locale);
  return transporter.sendMail({
    from: `"Promontolio Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `${texts.leadSubject}: ${sanitizeHeader(email)}`,
    text: `${texts.leadText}: ${email}\n${texts.sourceLabel}: ${source}\n${texts.localeLabel}: ${getEmailLocale(locale)}`,
  });
};

/**
 * Invia la Guida PDF all'utente (Lead Magnet)
 * Utilizza il tuo template originale
 */
const sendWelcomePDF = async (userEmail, pdfPath, locale = "de", unsubscribeUrl) => {
  assertEmailConfiguration();
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Guide PDF not found: ${pdfPath}`);
  }

  const texts = getEmailTexts(locale);
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
                    ${texts.guideBrand}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px 40px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #153643; font-family: 'Georgia', serif; font-size: 24px;">
                        <b>${texts.guideTitle}</b>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 25px;">
                        ${texts.guideThanks}
                        <br><br>
                        ${texts.guideDescription}
                        <br><br>
                        ${texts.guideDetails}
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding: 10px 0 0 0;">
                              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">${texts.guideMore}</p>
                              <a href="https://www.giuseppemancini.dev" target="_blank" style="background-color: #4a5d23; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;" class="button">
                                ${texts.guideButton}
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
                        ${texts.guideReason}
                        ${unsubscribeUrl ? `<br/><a href="${escapeHtml(unsubscribeUrl)}" style="color: #4a5d23;">${texts.unsubscribe}</a>` : ""}
                      </td>
                      <td align="right" style="width: 25%;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                              <a href="https://www.giuseppemancini.dev" style="color: #4a5d23; text-decoration: none;">${texts.website}</a>
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
    from: '"Promontolio" <' + process.env.EMAIL_USER + ">",
    to: userEmail,
    subject:
      getEmailLocale(locale) === "it"
        ? "La tua guida PDF: scopri l'oro del Gargano 🌿"
        : "Ihr PDF-Guide: Entdecken Sie das Gold des Gargano 🌿",
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

/**
 * Invia i messaggi del modulo Contatti a TE (Notifica interna)
 */
const sendContactMessage = async (name, email, message, locale = "de") => {
  assertEmailConfiguration();
  const texts = getEmailTexts(locale);
  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);
  const mailOptions = {
    from: `"Promontolio Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `${texts.contactSubject} ${safeName}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #4a5d23; border-radius: 8px;">
        <h2 style="color: #4a5d23; border-bottom: 1px solid #4a5d23; padding-bottom: 10px;">${texts.contactTitle}</h2>
        <p><strong>${texts.contactName}:</strong> ${escapeHtml(name)}</p>
        <p><strong>${texts.contactEmail}:</strong> <a href="mailto:${escapeHtml(safeEmail)}">${escapeHtml(safeEmail)}</a></p>
        <p><strong>${texts.contactMessage}:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4a5d23; font-style: italic;">
          ${escapeHtml(message).replace(/\r?\n/g, "<br />")}
        </div>
        <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #999;">${texts.contactFooter}</p>
      </div>
    `,
    replyTo: safeEmail,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomePDF,
  sendLeadConfirmation,
  sendLeadNotification,
  sendContactMessage,
  escapeHtml,
};
