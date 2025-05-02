// Funzione per caricare tutti gli eventi dal server e visualizzarli
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
          caricaEventiPersonali(); // Assicurati siano definiti
          caricaEventiPubblici();
        }
      })
      .catch(err => console.error("Errore durante modifica:", err));
  }
  
  function modificaEvento(eventoId) {
    const nuovoTitolo = prompt("Nuovo titolo:");
    const nuovaDescrizione = prompt("Nuova descrizione:");
    const nuovaData = prompt("Nuova data:");
  
    fetch(`/evento/${eventoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titolo: nuovoTitolo, descrizione: nuovaDescrizione, data: nuovaData })
    }).then(response => response.json())
      .then(data => {
        if (data.result === "ok") {
          alert("Evento modificato!");
          caricaEventiPersonali();
          caricaEventiPubblici();
        }
      })
      .catch(err => console.error("Errore durante la modifica dell'evento:", err));
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
      const response = await fetch(`/evento/${id}`);
      if (!response.ok) throw new Error('Evento non trovato');
  
      const evento = await response.json();
      const container = document.getElementById("dettaglioEvento");
  
      container.innerHTML = `
        <h3>${evento.titolo}</h3>
        <p><strong>Data:</strong> ${new Date(evento.data).toLocaleDateString()}</p>
        <p><strong>Creato da:</strong> ${evento.creatore || "Sconosciuto"}</p>
        <p><strong>Partecipanti:</strong> ${evento.partecipanti?.join(", ") || "Nessuno"}</p>
        <h4>Commenti:</h4>
        <div class="commenti-box">
          ${evento.commenti?.map(c => `
            <div class="commento">
              <p><strong>${c.autore}</strong> (${new Date(c.timestamp).toLocaleString()})</p>
              <p>${c.testo}</p>
              ${c.immagine ? `<img src="${c.immagine}" style="max-width: 200px;">` : ""}
            </div>
          `).join("") || "<p>Nessun commento ancora.</p>"}
        </div>
      `;
  
      mostraPagina("dettaglio");
  
    } catch (err) {
      console.error(err);
      document.getElementById("dettaglioEvento").innerHTML = "<p>Errore nel caricamento dell'evento.</p>";
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
  export {
    caricaEventiPubblici,
    caricaEventiPersonali,
    caricaDettaglioEvento,
    creaEvento
  };
  