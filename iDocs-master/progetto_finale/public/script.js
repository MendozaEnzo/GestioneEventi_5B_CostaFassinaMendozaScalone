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







caricaEventiPubblici();
