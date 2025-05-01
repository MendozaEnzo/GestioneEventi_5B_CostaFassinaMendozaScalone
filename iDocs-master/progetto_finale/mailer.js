const nodemailer = require('nodemailer');
const conf = require('./conf.js');  
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: conf.mailFrom,
    pass: conf.mailSecret
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
        from: conf.from,  
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
