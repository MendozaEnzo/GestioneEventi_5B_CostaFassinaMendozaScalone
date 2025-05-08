const express = require("express");
const http = require("http");
const path = require("path");
const fs = require('fs');
const bodyParser = require("body-parser");
const database = require("./database");
const mailer = require("./mailer");
const crypto = require("crypto");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, 'files'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});
const upload = multer({ storage: storage }).single('file');

const app = express();
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, 'files')));


database.createTables();

app.post("/upload", upload, async (req, res) => {
    await database.insert("./files/" + req.file.originalname);
    res.json({ result: "ok" });
});

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
      const id_post = await database.inserisciPost(req.body); 
      res.json({ result: "ok", id_post });  
      console.log("Post inserito con id:", id_post);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  


app.post("/contenuto", upload, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nessun file caricato" });
    }
  
    const { tipo, id_post } = req.body;
    const idPostInt = parseInt(id_post, 10);
    if (isNaN(idPostInt)) {
        return res.status(400).json({ error: "ID del post non valido" });
    }
    if (!tipo || !id_post) {
      return res.status(400).json({ error: "Tipo e ID del post sono obbligatori" });
    }
  
    
    const fileUrl = "/files/" + req.file.originalname;
  
    try {
      
      await database.inserisciContenuto({
        tipo,
        url: fileUrl,
        id_post: parseInt(id_post),
      });
  
      res.json({ result: "ok", id_post: id_post });
    } catch (e) {
      console.error("Errore durante l'inserimento del contenuto:", e);
      res.status(500).json({ error: "Errore durante l'inserimento del contenuto" });
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
app.post('/evento/:id/partecipanti', (req, res) => {
    const eventoId = req.params.id;
    const userId = req.body.userId;

    database.partecipaEvento(userId, eventoId)
        .then(() => {
            res.json({ result: "ok" });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ result: "error", message: err });
        });
});
app.post('/evento/:id/partecipa', async (req, res) => {
    const eventoId = req.params.id;
    const { id_utente, username, partecipa } = req.body;

    console.log("eventoId:", eventoId);
    console.log("id_utente:", id_utente);
    console.log("username:", username);

    try {
        const utenti = await database.getUtenti();
        let utente;

        if (id_utente) {
            utente = utenti.find(u => u.id === Number(id_utente));
        } else if (username) {
            utente = utenti.find(u => u.nome === username);
        }

        if (!utente) {
            return res.status(404).json({ success: false, message: "Utente non trovato" });
        }

        if (partecipa === false) {
            await database.rimuoviPartecipazione(utente.id, eventoId);
            return res.json({ success: true, message: "Partecipazione rimossa" });
        }

        const result = await database.partecipaEvento(utente.id, eventoId);

        if (result?.error || result?.message) {
            return res.status(400).json({ success: false, message: result.error || result.message });
        }

        res.json({ success: true, message: 'Partecipazione completata con successo' });
    } catch (err) {
        console.error("Errore durante la partecipazione:", err);
        res.status(500).json({ success: false, message: "Errore durante la partecipazione" });
    }
});

/*app.post('/evento/:eventoId/partecipa', async (req, res) => {
    // Estrai id_utente e id_evento dal corpo della richiesta
    const { id_utente } = req.body;
    const id_evento = req.params.eventoId;
    console.log("utenteId: ",id_utente);
    console.log("eventoId: ",id_evento);
    if (!id_utente || !id_evento) {
        return res.status(400).json({ success: false, message: 'Utente o evento non specificati' });
    }

    console.log(`Partecipazione evento richiesta per utente ${id_utente} all'evento ${id_evento}`);

    try {
        // Recupera la lista degli utenti, o fai altre operazioni per validare l'utente
        const utenti = await database.getUtenti();
        const utente = utenti.find(u => u.id === Number(id_utente)); // Assicurati che tu abbia un campo 'id' per identificare l'utente
        console.log("Lista utenti dal DB:", utenti.map(u => u.id));
        console.log("Cerco ID:", id_utente);    
        if (!utente) {
            return res.status(404).json({ success: false, message: "Utente non trovato" });
        }

        // Aggiungi l'utente all'evento (esempio di aggiunta alla partecipazione)
        const result = await database.partecipaEvento(id_utente, id_evento);

        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }

        res.json({ success: true, message: 'Partecipazione completata con successo' });
    } catch (err) {
        console.error("Errore durante la partecipazione:", err);
        res.status(500).json({ success: false, message: "Errore durante la partecipazione" });
    }
});
*/



app.post("/invito", async (req, res) => {
    const { evento_id, mittente_id, destinatario_id, stato, data } = req.body;
    console.log("Dati ricevuti dal frontend:", { evento_id, mittente_id, destinatario_id, stato, data });
    try {
        await database.invitaUtente(evento_id, mittente_id, destinatario_id, stato, data);
        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore durante l'invito:", e.message);
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


app.get("/inviti/:utente_id", async (req, res) => {
    try {
        const inviti = await database.getInvitiByUtente(req.params.utente_id);
        res.json(inviti);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/partecipazioni/:utente_id", async (req, res) => {
    try {
        const partecipazioni = await database.getPartecipazioniByUtente(req.params.utente_id);
        res.json(partecipazioni);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/evento/:id/partecipanti', (req, res) => {
    const eventoId = req.params.id;
    database.getNumeroPartecipantiEvento(eventoId)
        .then(result => {
            const numero = result[0]?.numero || 0;
            res.json({ numero });
        })
        .catch(err => res.status(500).json({ error: err }));
});


app.get("/post/evento/:evento_id", async (req, res) => {
    try {
        const post = await database.getPostByEvento(req.params.evento_id);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/contenuti/post/:post_id", async (req, res) => {
    try {
        const contenuti = await database.getContenutiByPost(req.params.post_id);
        res.json(contenuti);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.get("/post-completo/:post_id", async (req, res) => {
    try {
        const post = await database.getPostConContenuti(req.params.post_id);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/post/utente/:id', async (req, res) => {
    try {
      const posts = await database.getPostByAutore(parseInt(req.params.id));
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Errore nel recupero dei post utente' });
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
// Recupera un singolo post con i contenuti
app.get("/post/:id", async (req, res) => {
    try {
        const post = await database.getPostConContenuti(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post non trovato" });
        }
        res.json(post);
    } catch (e) {
        console.error("Errore nel recupero del post:", e);
        res.status(500).json({ error: "Errore nel recupero del post" });
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
app.put('/post/:id', async (req, res) => {
    const postId = parseInt(req.params.id); 
    const { tipo, evento_id, data_post, contenuti } = req.body; 

    if (!postId || !tipo || !evento_id || !data_post) {
        return res.status(400).json({ error: 'Dati insufficienti per aggiornare il post.' });
    }

    try {
        await database.updatePost(postId, { tipo, evento_id, data_post, contenuti });
        res.status(200).json({ message: 'Post e contenuti aggiornati con successo!' });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del post:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento del post.' });
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
app.delete("/post/:id", async (req, res) => {
    try {
      await database.deletePost(req.params.id);
      res.json({ result: "ok" });
    } catch (e) {
      res.status(500).json({ error: "Errore nella cancellazione del post" });
    }
  });
//invito accettato/rifiutato
app.put("/invito", async (req, res) => {
    const { evento_id, utente_destinatario_id, stato } = req.body;

    if (!evento_id || !utente_destinatario_id || !stato) {
        return res.status(400).json({ error: "Dati mancanti" });
    }

    try {
        await database.aggiornaStatoInvito(evento_id, utente_destinatario_id, stato);
        res.json({ result: "ok" });
    } catch (e) {
        console.error("Errore durante l'aggiornamento dello stato dell'invito:", e);
        res.status(500).json({ error: "Aggiornamento fallito" });
    }
});



// Server HTTP
const server = http.createServer(app);
const port = 5600;
server.listen(port, () => {
    console.log(`✅ Server in esecuzione su http://localhost:${port}`);
});
