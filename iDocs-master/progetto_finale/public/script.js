import { createLogin } from './login.js';
import { createNavigator } from "./navigator.js";

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

createLogin();
createNavigator(document.querySelector("main"));

document.getElementById("dashboardBtn").onclick = function () {
  location.hash = "#dashboard";
};

document.getElementById("add-event-btn").onclick = function () {
  apriModaleEvento();
};

document.getElementById("closeAddEvent").onclick = function () {
  chiudiModaleEvento();
};

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

  if (!userId) {
    alert("Devi essere loggato per creare un evento.");
    return;
  }

  if (!titolo || !data || !descrizione) {
    alert("Compila tutti i campi.");
    return;
  }

  try {
    await fetch("/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titolo,
        data,
        descrizione,
        creatore_id: userId
      })
    });

    chiudiModaleEvento();
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventDescription").value = "";
    await caricaEventiPubblici();
    if (typeof caricaEventiPersonali === "function") {
      caricaEventiPersonali();
    }

  } catch (error) {
    console.error("Errore nella creazione dell'evento:", error);
    alert("Si è verificato un errore nella creazione dell'evento. Riprova più tardi.");
  }
}

async function caricaEventiPubblici() {
  try {
    const response = await fetch('/eventi');
    if (!response.ok) {
      throw new Error('Impossibile recuperare gli eventi');
    }

    const eventi = await response.json();
    console.log(eventi);

    if (eventi.length === 0) {
      document.getElementById("eventiPubblici").innerHTML = "Non ci sono eventi pubblici.";
      return;
    }

    const eventiContainer = document.getElementById("eventiPubblici");
    eventiContainer.innerHTML = "";

    let eventiHTML = '';

    eventi.forEach(evento => {
      const creatore = evento.creatore || "Creatore sconosciuto";

      eventiHTML += `
        <div class="evento"> 
          <h3>${evento.titolo}</h3>
          <p>${evento.descrizione}</p>
          <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
          <p>Creato da: ${creatore}</p>
        </div>
      `;
    });

    eventiContainer.innerHTML = eventiHTML;

  } catch (error) {
    console.error("Errore nel recupero degli eventi pubblici:", error);
    document.getElementById("eventiPubblici").innerHTML = "Si è verificato un errore nel recupero degli eventi.";
  }
}

document.getElementById("dashboardBtn").onclick = function () {
  location.hash = "#dashboard";
  caricaEventiPersonali();
};

async function caricaEventiPersonali() {
  const userId = sessionStorage.getItem("userId");

  if (!userId) {
    console.log("Nessun utente loggato");
    return;
  }

  try {
    const response = await fetch("/eventi");
    if (!response.ok) {
      throw new Error('Impossibile recuperare gli eventi');
    }

    const eventi = await response.json();
    console.log("Eventi caricati:", eventi);

    const container = document.getElementById("my-events");
    if (!container) {
      console.error("Contenitore degli eventi non trovato!");
      return;
    }

    container.innerHTML = "";

    const mieiEventi = eventi.filter(evento => evento.creatore_id === parseInt(userId));
    console.log("Miei eventi:", mieiEventi);

    if (mieiEventi.length === 0) {
      container.innerHTML = "Non hai creato eventi.";
    } else {
      let eventiHTML = "";

      mieiEventi.forEach(evento => {
        eventiHTML += `
          <div class="evento-personale">
            <div class="info">
              <h4>${evento.titolo}</h4>
              <p>${new Date(evento.data).toLocaleDateString()}</p>
            </div>
            <button class="manage-btn">Manage</button>
          </div>
        `;
      });

      container.innerHTML = eventiHTML;
    }
  } catch (err) {
    console.error("Errore nel caricamento dei tuoi eventi", err);
  }
}

caricaEventiPubblici();
