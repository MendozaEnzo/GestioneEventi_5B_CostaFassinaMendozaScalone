import { createLogin } from './login.js';
import { createNavigator } from "./navigator.js";
export { caricaDettaglioEvento };

import {
  caricaEventiPubblici,
  caricaEventiPersonali,
  caricaDettaglioEvento,
  creaEvento,
  salvaModificaEvento
} from "./eventi.js";

const loginLink = document.querySelector('.nav-right a[href="#login"]');
const closeBtn = document.getElementById("closeLogin");
const homeLink = document.querySelector('.nav-left a[href="#homepage"]');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const dashboardBtn = document.getElementById("dashboardBtn");
const addEventBtn = document.getElementById("add-event-btn");
const closeAddEventBtn = document.getElementById("closeAddEvent");
const creaEventoBtn = document.getElementById("creaEventoBtn");

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

if (dashboardBtn) {
  dashboardBtn.onclick = function () {
    location.hash = "#dashboard";
    caricaEventiPersonali();
  };
}

if (addEventBtn) {
  addEventBtn.onclick = function () {
    apriModaleEvento();
  };
}

if (closeAddEventBtn) {
  closeAddEventBtn.onclick = function () {
    chiudiModaleEvento();
  };
}

if (creaEventoBtn) {
  creaEventoBtn.onclick = function () {
    creaEvento();
  };
}

function apriModaleEvento() {
  document.getElementById("addEventModal").classList.remove("hidden");
}

function chiudiModaleEvento() {
  document.getElementById("addEventModal").classList.add("hidden");
}

function filtroEventi() {
  const searchText = searchInput.value.toLowerCase().trim();
  const eventiContainer = document.getElementById('eventiPubblici');
  const eventi = eventiContainer.querySelectorAll('.evento');

  if (!eventi) return;

  for (let i = 0; i < eventi.length; i++) {
    const evento = eventi[i];
    const titolo = evento.querySelector('h3')?.textContent.toLowerCase() || '';
    const descrizione = evento.querySelector('p')?.textContent.toLowerCase() || '';
    const data = evento.querySelectorAll('p')[1]?.textContent.toLowerCase() || '';
    const creatore = evento.querySelectorAll('p')[2]?.textContent.toLowerCase() || '';

    if (
      titolo.includes(searchText) ||
      descrizione.includes(searchText) ||
      data.includes(searchText) ||
      creatore.includes(searchText)
    ) {
      evento.style.display = 'block';
    } else {
      evento.style.display = 'none';
    }
  }
}

if (searchBtn) {
  searchBtn.onclick = filtroEventi;
}

if (searchInput) {
  searchInput.onkeypress = function (event) {
    if (event.key === 'Enter') {
      filtroEventi();
    }
  };
}

// Funzione per ripristinare la ricerca
function ripristinaEventi() {
  searchInput.value = '';
  caricaEventiPubblici();
}

if (homeLink) {
  homeLink.onclick = function (e) {
    e.preventDefault();
    location.hash = "#homepage";
    ripristinaEventi();
  };
}

// Bottone ❌ per cancellare la ricerca
if (clearSearchBtn) {
  clearSearchBtn.onclick = function () {
    ripristinaEventi();
  };
}

let eventoInModifica = null;
export function apriModaleModifica(evento) {
  eventoInModifica = evento.id;
  document.getElementById("editEventTitle").value = evento.titolo;
  document.getElementById("editEventDate").value = evento.data;
  document.getElementById("editEventDescription").value = evento.descrizione;
  document.getElementById("editEventModal").classList.remove("hidden");
}

caricaEventiPubblici();