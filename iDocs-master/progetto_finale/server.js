const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const database = require("./database");
const mailer = require("./mailer");
const crypto = require("crypto");



const app = express();
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));


database.createTables();

// ========== ROTTE POST (INSERT) ==========


app.post("/utente", async (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: "Nome ed email obbligatori." });
    }

    const password = crypto.randomUUID().split('-')[0]; 

    try {
        await mailer.send(email, "La tua password di accesso", `La tua password è: ${password}`);

        await database.insertUtente({ nome, email, password });

        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore nella registrazione:", e);
        res.status(500).json({ error: "Registrazione fallita" });
    }
});


app.post("/evento", async (req, res) => {
    try {
        await database.insertEvento(req.body);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.post("/invito", async (req, res) => {
    const { evento_id, mittente_id, destinatario_id, stato, data } = req.body;
    try {
        await database.invitaUtente(evento_id, mittente_id, destinatario_id, stato, data);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.post("/partecipa", async (req, res) => {
    const { id_utente, id_evento } = req.body;
    try {
        await database.partecipaEvento(id_utente, id_evento);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.post("/post", async (req, res) => {
    try {
        await database.inserisciPost(req.body);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.post("/contenuto", async (req, res) => {
    try {
        await database.inserisciContenuto(req.body);
        res.json({ result: "ok" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/login", async (req, res) => {
    const { nome, password } = req.body;
    try {
        const utenti = await database.getUtenti(); 
        const utente = utenti.find(u => u.nome === nome && u.password === password);
        if (utente) {
            res.json(utente);
        } else {
            res.status(401).json({ error: "Credenziali errate" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});




// ========== ROTTE GET ==========


app.get("/utenti", async (req, res) => {
    try {
        const utenti = await database.getUtenti();
        res.json(utenti);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/utente/:id", async (req, res) => {
    try {
        const utente = await database.getUtenteById(req.params.id);
        res.json(utente);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/eventi", async (req, res) => {
    try {
        const eventi = await database.getEventi();
        res.json(eventi);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/eventi/creatore/:id", async (req, res) => {
    try {
        const eventi = await database.getEventiByCreatore(req.params.id);
        res.json(eventi);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ottieni inviti ricevuti da un utente
app.get("/inviti/:utente_id", async (req, res) => {
    try {
        const inviti = await database.getInvitiByUtente(req.params.utente_id);
        res.json(inviti);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ottieni eventi a cui partecipa un utente
app.get("/partecipazioni/:utente_id", async (req, res) => {
    try {
        const partecipazioni = await database.getPartecipazioniByUtente(req.params.utente_id);
        res.json(partecipazioni);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ottieni post per evento
app.get("/post/evento/:evento_id", async (req, res) => {
    try {
        const post = await database.getPostByEvento(req.params.evento_id);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ottieni contenuti per post
app.get("/contenuti/post/:post_id", async (req, res) => {
    try {
        const contenuti = await database.getContenutiByPost(req.params.post_id);
        res.json(contenuti);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ottieni post con contenuti
app.get("/post-completo/:post_id", async (req, res) => {
    try {
        const post = await database.getPostConContenuti(req.params.post_id);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get("/evento/:id", async (req, res) => {
    try {
    const eventoArray = await database.getEventoById(req.params.id);
    const evento = eventoArray[0];
    if (!evento) {
    return res.status(404).json({ error: "Evento non trovato" });
}

  
      const partecipanti = await database.getPartecipantiEvento(req.params.id);
      const post = await database.getPostByEvento(req.params.id);
  
      // Per ogni post, carica i contenuti associati
      const postConContenuti = await Promise.all(post.map(async (p) => {
        const contenuti = await database.getContenutiByPost(p.id);
        const immagine = contenuti.find(c => c.tipo === 'img')?.valore;
        return {
          autore: p.autore,
          testo: p.testo,
          timestamp: p.timestamp,
          immagine: immagine || null
        };
      }));
  
      res.json({
        id: evento.id,
        titolo: evento.titolo,
        data: evento.data,
        creatore: evento.creatore,
        partecipanti: partecipanti.map(p => p.nome),
        commenti: postConContenuti
      });
  
    } catch (e) {
      console.error("Errore nel recupero evento:", e);
      res.status(500).json({ error: "Errore nel recupero dell'evento" });
    }
  });
  

//modifica 
app.put("/evento/:id", async (req, res) => {
    try {
        await database.updateEvento(req.params.id, req.body);
        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore nella modifica evento:", e);
        res.status(500).json({ error: "Modifica fallita" });
    }
});
//elimina
app.delete("/evento/:id", async (req, res) => {
    try {
        await database.deleteEvento(req.params.id);
        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore nella cancellazione evento:", e);
        res.status(500).json({ error: "Eliminazione fallita" });
    }
});

// Server HTTP
const server = http.createServer(app);
const port = 5600;
server.listen(port, () => {
    console.log(`✅ Server in esecuzione su http://localhost:${port}`);
});
