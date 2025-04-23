import { createLogin } from './login.js';
import { createNavigator } from "./navigator.js";

// Apertura login modal
const loginLink = document.querySelector('.nav-right a[href="#login"]');
const closeBtn = document.getElementById("closeLogin");

if (loginLink) {
  loginLink.onclick = (e) => {
    e.preventDefault();
    console.log("Login modal opened");
    document.getElementById("loginModal").classList.remove("hidden");
    document.body.classList.add("modal-open");
  };
}

if (closeBtn) {
  closeBtn.onclick = () => {
    console.log("Login modal closed");
    document.getElementById("loginModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}

// Login e navigazione
createLogin();
createNavigator(document.querySelector("main"));

// Navigazione verso la dashboard
document.getElementById("dashboardBtn").onclick = function () {
  location.hash = "#dashboard";
};

// Navigazione verso homepage dopo logout
document.getElementById("logoutBtn").onclick = function () {
  location.hash = "#homepage";
};

// Mostra modale evento
document.getElementById("add-event-btn").onclick = function () {
  apriModaleEvento();
};

// Chiudi modale evento
document.getElementById("closeAddEvent").onclick = function () {
  chiudiModaleEvento();
};

// Crea evento
document.getElementById("creaEventoBtn").onclick = function () {
  creaEvento();
};

function apriModaleEvento() {
  document.getElementById("addEventModal").classList.remove("hidden");
}

function chiudiModaleEvento() {
  document.getElementById("addEventModal").classList.add("hidden");
}

async function creaEvento() {
  const titolo = document.getElementById("eventTitle").value;
  const data = document.getElementById("eventDate").value;
  const descrizione = document.getElementById("eventDescription").value;
  const userId = sessionStorage.getItem("userId");

  // Controllo se l'utente è loggato
  if (!userId) {
    alert("Devi essere loggato per creare un evento.");
    return;
  }

  // Controllo se tutti i campi sono stati riempiti
  if (!titolo || !data || !descrizione) {
    alert("Compila tutti i campi.");
    return;
  }

  try {
    // Invia la richiesta per creare l'evento
    await fetch("/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titolo,
        data,
        descrizione,
        creatore_id: userId  // Passa l'ID dell'utente loggato
      })
    });

    // Se l'evento è stato creato con successo
    chiudiModaleEvento();
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventDescription").value = "";

    // Ricarica la lista degli eventi personali, se la funzione è definita
    if (typeof caricaEventiPersonali === "function") {
      caricaEventiPersonali();
    }

  } catch (error) {
    // Gestione degli errori nel caso di problemi con la creazione dell'evento
    console.error("Errore nella creazione dell'evento:", error);
    alert("Si è verificato un errore nella creazione dell'evento. Riprova più tardi.");
  }
}

async function caricaEventiPubblici() {
  try {
    const response = await fetch('/eventi'); // Chiamata per ottenere gli eventi dal server
    if (!response.ok) {
      throw new Error('Impossibile recuperare gli eventi');
    }

    const eventi = await response.json(); // Ottieni gli eventi in formato JSON
    console.log(eventi);
    // Se non ci sono eventi, mostra un messaggio
    if (eventi.length === 0) {
      document.getElementById("eventiPubblici").innerHTML = "Non ci sono eventi pubblici.";
      return;
    }

    // Altrimenti, mostra gli eventi
    const eventiContainer = document.getElementById("eventiPubblici");
    eventiContainer.innerHTML = ""; // Pulisci il contenuto precedente

    // Creare il contenuto HTML da aggiungere
    let eventiHTML = '';

    eventi.forEach(evento => {
      // Gestisci il caso in cui il campo "creatore" sia undefined
      const creatore = evento.creatore || "Creatore sconosciuto"; // Se "creatore" è undefined, mostra "Creatore sconosciuto"

      eventiHTML += `
        <div class="evento"> 
          <h3>${evento.titolo}</h3>
          <p>${evento.descrizione}</p>
          <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
          <p>Creato da: ${creatore}</p>
        </div>
      `;
    });

    // Aggiungi il contenuto HTML all'interno del container
    eventiContainer.innerHTML = eventiHTML;

  } catch (error) {
    console.error("Errore nel recupero degli eventi pubblici:", error);
    document.getElementById("eventiPubblici").innerHTML = "Si è verificato un errore nel recupero degli eventi.";
  }
}

// Esegui la funzione al caricamento della pagina
caricaEventiPubblici(); // Carica gli eventi pubblici quando la pagina è pronta


