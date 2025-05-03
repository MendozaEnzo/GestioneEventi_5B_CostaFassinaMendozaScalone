import { createLogin } from './login.js';
import { caricaPostEvento,aggiungiPost } from './post.js';

// Crea la logica di login
const loginManager = createLogin();

// Usa loginManager.isLogged() per verificare se l'utente è loggato
if (loginManager.isLogged()) {
  console.log("Utente loggato!");
}

// Funzione per caricare tutti gli eventi dal server e visualizzarli
let eventoInModifica = null;
document.getElementById("salvaModificaBtn").onclick = salvaModificaEvento;
export function salvaModificaEvento() {
  const titolo = document.getElementById("editEventTitle").value;
  const data = document.getElementById("editEventDate").value;
  const descrizione = document.getElementById("editEventDescription").value;



  fetch(`/evento/${eventoInModifica}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titolo, descrizione, data })
  }).then(r => r.json())
    .then(data => {
      if (data.result === "ok") {
        alert("Evento modificato!");
        chiudiModaleModifica();
        caricaEventiPersonali();
        caricaEventiPubblici();
      }
    })
    .catch(err => console.error("Errore durante modifica:", err));
}

function modificaEvento(eventoId) {
  fetch(`/evento/${eventoId}`)
    .then(res => res.json())
    .then(evento => {
      eventoInModifica = evento.id;
      document.getElementById("editEventTitle").value = evento.titolo;
      if (evento.data) {
        document.getElementById("editEventDate").value = evento.data.split("T")[0];
      } else {
        console.warn("Data evento mancante per evento ID:", evento.id);
        document.getElementById("editEventDate").value = "";
      }
      
      document.getElementById("editEventDescription").value = evento.descrizione;
      document.getElementById("editEventModal").classList.remove("hidden");
    })
    .catch(err => console.error("Errore nel recupero evento da modificare:", err));
}

  
  function eliminaEvento(eventoId) {
    if (confirm("Sei sicuro di voler eliminare questo evento?")) {
      fetch(`/evento/${eventoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => response.json())
        .then(data => {
          if (data.result === "ok") {
            alert("Evento eliminato!");
            caricaEventiPersonali();
            caricaEventiPubblici();
          }
        })
        .catch(err => console.error("Errore durante l'eliminazione dell'evento:", err));
    }
  }
  
  // =====================
  // Funzione: caricaEventiPubblici
  // =====================
  async function caricaEventiPubblici() {
    try {
      const response = await fetch('/eventi');
      if (!response.ok) throw new Error('Impossibile recuperare gli eventi');
  
      const eventi = await response.json();
      eventi.sort((a, b) => new Date(a.data) - new Date(b.data));
  
      const container = document.getElementById("eventiPubblici");
      container.innerHTML = eventi.length === 0
        ? "Non ci sono eventi pubblici."
        : eventi.map(evento => `
            <div class="evento"> 
              <h3>${evento.titolo}</h3>
              <p>${evento.descrizione}</p>
              <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
              <p>Creato da: ${evento.creatore || "Creatore sconosciuto"}</p>
              <button class="dettaglio-btn" data-id="${evento.id}">Vai al dettaglio</button>
            </div>
          `).join("");
  
      document.querySelectorAll(".dettaglio-btn").forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-id");
          location.hash = `#dettaglio_${id}`;
        };
      });
  
    } catch (error) {
      console.error("Errore nel recupero degli eventi pubblici:", error);
      document.getElementById("eventiPubblici").innerHTML = "Errore nel recupero degli eventi.";
    }
  }
  
  // =====================
  // Funzione: caricaEventiPersonali
  // =====================
  async function caricaEventiPersonali() {
    const userId = sessionStorage.getItem("userId");
    console.log("User ID:", userId);
  
    if (!userId) {
      console.log("Nessun utente loggato");
      return;
    }
  
    try {
      const response = await fetch("/eventi");
      if (!response.ok) {
        throw new Error("Impossibile recuperare gli eventi");
      }
  
      const eventi = await response.json();
      const container = document.getElementById("my-events");
  
      if (!container) {
        console.error("Contenitore degli eventi non trovato!");
        return;
      }
  
      const mieiEventi = eventi.filter(evento => evento.creatore_id === parseInt(userId));
      mieiEventi.sort((a, b) => new Date(a.data) - new Date(b.data));
  
      if (mieiEventi.length === 0) {
        container.innerHTML = "Non hai creato eventi.";
      } else {
        let eventiHTML = "";
  
        mieiEventi.forEach(evento => {
          eventiHTML += `
            <div class="evento-personale" data-id="${evento.id}">
              <div class="info">
                <h4>${evento.titolo}</h4>
                <p>${new Date(evento.data).toLocaleDateString()}</p>
              </div>
              <button class="modifica-btn">Modifica</button>
              <button class="elimina-btn">Elimina</button>
            </div>
          `;
        });
  
        container.innerHTML = eventiHTML;
  
        
        document.querySelectorAll(".evento-personale").forEach(div => {
          const id = div.getAttribute("data-id");
          div.querySelector(".modifica-btn").onclick = () => modificaEvento(id);
          div.querySelector(".elimina-btn").onclick = () => eliminaEvento(id);
        });
      }
    } catch (err) {
      console.error("Errore nel caricamento dei tuoi eventi", err);
    }
  }
  
  
  // =====================
  // Funzione: caricaDettaglioEvento
  // =====================
async function caricaDettaglioEvento(id) {
  try {
    const res = await fetch(`/evento/${id}`);
    if (!res.ok) throw new Error('Evento non trovato');

    const evento = await res.json();
    const userName = sessionStorage.getItem("username");
    const container = document.getElementById("dettaglioEvento");

    const partecipanti = evento.partecipanti?.map(p => String(p)) || [];
    const isPartecipante = userName && partecipanti.includes(userName);

    // BOTTONI PARTECIPAZIONE IN ALTO
    let html = `<div class="partecipazione-top">
      ${userName ? `
        <button id="partecipaBtn" class="btn" style="display: ${isPartecipante ? 'none' : 'inline-block'}">Partecipa</button>
        <button id="nonPartecipaBtn" class="btn" style="display: ${isPartecipante ? 'inline-block' : 'none'}">Annulla partecipazione</button>
      ` : `<p>Per partecipare, <a href="#login">effettua il login</a></p>`}
    </div>`;

    // TITOLO E INFORMAZIONI
    html += `
      <h3>${evento.titolo}</h3>
      <p><strong>Data:</strong> ${new Date(evento.data).toLocaleDateString()}</p>
      <p><strong>Creato da:</strong> ${evento.creatore || 'Sconosciuto'}</p>
      <p><strong>Partecipanti:</strong> ${partecipanti.join(', ') || 'Nessuno'}</p>
    `;

    // SEZIONE POST (ex commenti)
    html += `
      <div class="post-section">
        <h4>Post:</h4>
        <button id="aggiungiPostBtn" style="display: ${isPartecipante ? 'inline-block' : 'none'}">Aggiungi Post</button>
        <div id="postList">Caricamento post…</div>
      </div>
    `;

    container.innerHTML = html;

      // Bind partecipazione
    if (userName) {
      const partecipaBtn = document.getElementById('partecipaBtn');
      if (partecipaBtn) {
        partecipaBtn.onclick = () => partecipazioneEvento(id, userName, true);
      }      
      const nonPartecipaBtn = document.getElementById('nonPartecipaBtn');
      if (nonPartecipaBtn) {
        nonPartecipaBtn.onclick = () => partecipazioneEvento(id, userName, false);
      }

    }

    // Bind apertura modali per i post
    const newPostMetaBtn = document.getElementById('newPostMetaBtn');
    if (newPostMetaBtn) {
      newPostMetaBtn.onclick = () => document.getElementById('postMetaModal').classList.remove('hidden');
    }

    const newPostContentBtn = document.getElementById('newPostContentBtn');
    if (newPostContentBtn) {
      newPostContentBtn.onclick = () => document.getElementById('postContentModal').classList.remove('hidden');
    }

    // Bind salvataggio della modale metadata (tipo + data)
    const saveMetaBtn = document.getElementById('saveMetaBtn');
    if (saveMetaBtn) {
      saveMetaBtn.onclick = () => inserisciMetaPost(id);
    }

    // Bind salvataggio della modale contenuto
    const saveContentBtn = document.getElementById('saveContentBtn');
    if (saveContentBtn) {
      saveContentBtn.onclick = () => {
        const postId = document.getElementById('postSelect').value;
        inserisciContenutoPost(postId);
      };
    }

    // Bind aggiunta testo semplice
    const aggiungiPostBtn = document.getElementById('aggiungiPostBtn');
    if (aggiungiPostBtn) {
      aggiungiPostBtn.onclick = () => aggiungiPost(id);
    }


    // Carica i post e mostra la pagina
    await caricaPostEvento(id);
    mostraPagina('dettaglio');
  }

  catch (err) {
    console.error(err);
  }
}
  
  

  
  
  // Funzione per aggiungere o rimuovere un partecipante
  async function partecipazioneEvento(eventoId, username, partecipa) {
    try {
      const response = await fetch(`/evento/${eventoId}/partecipa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, partecipa })
      });
  
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
  
      await caricaDettaglioEvento(eventoId); // Aggiorna la UI
    } catch (err) {
      console.error("Errore nella gestione della partecipazione:", err);
      alert("Errore nella gestione della partecipazione.");
    }
  }
  
  
  
  
  
  
  // =====================
  // Funzione: creaEvento
  // =====================
  async function creaEvento() {
    const titolo = document.getElementById("eventTitle").value;
    const data = document.getElementById("eventDate").value;
    const descrizione = document.getElementById("eventDescription").value;
    const userId = sessionStorage.getItem("userId");
  
    if (!userId) return alert("Devi essere loggato per creare un evento.");
    if (!titolo || !data || !descrizione) return alert("Compila tutti i campi.");
  
    try {
      await fetch("/evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titolo, data, descrizione, creatore_id: userId })
      });
  
      chiudiModaleEvento();
      document.getElementById("eventTitle").value = "";
      document.getElementById("eventDate").value = "";
      document.getElementById("eventDescription").value = "";
  
      await caricaEventiPubblici();
      if (typeof caricaEventiPersonali === "function") caricaEventiPersonali();
  
    } catch (error) {
      console.error("Errore nella creazione dell'evento:", error);
      alert("Errore nella creazione dell'evento. Riprova più tardi.");
    }
  }
  function mostraPagina(idPagina) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(idPagina).classList.remove("hidden");
  }
  
  function chiudiModaleEvento() {
    document.getElementById("addEventModal").classList.add("hidden");
  }
  function chiudiModaleModifica() {
    document.getElementById("editEventModal").classList.add("hidden");
  }
  export {
    caricaEventiPubblici,
    caricaEventiPersonali,
    caricaDettaglioEvento,
    creaEvento
  };
  





