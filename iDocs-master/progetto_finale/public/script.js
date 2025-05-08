import { createLogin } from './login.js';
import { createNavigator } from "./navigator.js";
export { caricaDettaglioEvento };
import {
  caricaEventiPubblici,
  caricaEventiPersonali,
  caricaDettaglioEvento,
  creaEvento,
  salvaModificaEvento} from "./eventi.js";

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








document.getElementById("dashboardBtn").onclick = function () {
  location.hash = "#dashboard";
  caricaEventiPersonali();
};

let eventoInModifica = null;

export function apriModaleModifica(evento) {
  eventoInModifica = evento.id;

  document.getElementById("editEventTitle").value = evento.titolo;
  document.getElementById("editEventDate").value = evento.data;
  document.getElementById("editEventDescription").value = evento.descrizione;

  document.getElementById("editEventModal").classList.remove("hidden");
}

// Questo codice si troverà alla fine del file, dopo che il DOM è stato caricato
const aggiungiPostBtn = document.getElementById('aggiungiPostBtn');
if (aggiungiPostBtn) {
  aggiungiPostBtn.onclick = () => {
    document.getElementById('aggiungiPostModal').classList.remove('hidden');
  };
} else {
  console.log("Elemento 'aggiungiPostBtn' non trovato!");
}

// Gestione chiusura della modale
const closeAddPost = document.getElementById('closeAddPost');
if (closeAddPost) {
  closeAddPost.onclick = () => {
    document.getElementById('aggiungiPostModal').classList.add('hidden');
  };
}


function filtroEventi() {
  const searchText = document.getElementById('searchInput').value;
  const eventiContainer = document.getElementById('eventiPubblici');
  const eventi = eventiContainer.querySelectorAll('.evento');
  
  const testoRicerca = searchText.toLowerCase().trim();
  
  if (testoRicerca === '') {
    for (let i = 0; i < eventi.length; i++) {
      eventi[i].style.display = 'block';
    }
    return;
  }
  
  for (let i = 0; i < eventi.length; i++) {
    const evento = eventi[i];
    const titolo = evento.querySelector('h3').textContent.toLowerCase();
    const descrizione = evento.querySelector('p').textContent.toLowerCase();
    const data = evento.querySelectorAll('p')[1] ? evento.querySelectorAll('p')[1].textContent.toLowerCase() : '';
    const creatore = evento.querySelectorAll('p')[2] ? evento.querySelectorAll('p')[2].textContent.toLowerCase() : '';
    
    if (titolo.includes(testoRicerca) || 
        descrizione.includes(testoRicerca) || 
        data.includes(testoRicerca) || 
        creatore.includes(testoRicerca)) {
      evento.style.display = 'block';
    } else {
      evento.style.display = 'none';
    }
  }
}

document.getElementById('searchBtn').onclick = filtroEventi;

document.getElementById('searchInput').onkeypress = function(event) {
  if (event.key === 'Enter') {
    filtroEventi();
  }
};




caricaEventiPubblici();
