const nodemailer = require('nodemailer');
const conf = require('./conf.js');  // Importa conf.js

// Configurazione per il trasportatore di email
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: conf.mailFrom,  // Usa il valore da conf.js
    pass: conf.mailSecret, // Usa la password da conf.js
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Configurazione di nodemailer corretta!');
  }
});

const result = {
  send: async (email, subject, text) => {
    try {
      return await transporter.sendMail({
        from: conf.from,  // Usa il valore da conf.js
        to: email,
        subject: subject,
        text: text
      });
    } catch (error) {
      console.log("Errore nell'invio dell'email:");
      console.log(error);
    }
  },
  test: async () => {
    return transporter.verify();
  }
};

module.exports = result;
