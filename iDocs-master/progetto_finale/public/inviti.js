let selectedEventoId = null;
let utenti = [];
let utentiInvitati = [];
let utenteLoggatoId = parseInt(sessionStorage.getItem("userId"));
if (isNaN(utenteLoggatoId)) {
    console.log("Errore: l'ID dell'utente non è stato trovato.");
}
const userId = sessionStorage.getItem("userId");



export function inizializzaInviti(eventoId, userId) {
    selectedEventoId = eventoId;
    utenteLoggatoId = userId;

    console.log("Inizializzazione inviti", eventoId, userId);
   
    const invitationSection = document.getElementById("invitationSection");
    if (invitationSection) {
        invitationSection.classList.remove("hidden");
    }


    caricaUtenti();
    caricaInvitiRicevuti();
    
}

function caricaUtenti() {
    fetch('/utenti')
        .then(res => res.json())
        .then(data => {
            utenti = data;
            
            const listaUtentiInvitabili = utenti.filter(utente => parseInt(utente.id) !== parseInt(utenteLoggatoId));
            console.log("Utente loggato:", utenteLoggatoId);
            console.log("lista utenti: ",listaUtentiInvitabili);

            let html = '';
            listaUtentiInvitabili.forEach(utente => {
                html += `
                    <label>
                        <input type="checkbox" value="${utente.id}" />
                        ${utente.nome}
                    </label><br/>
                `;
            });

            const invitableUsersList = document.getElementById('invitableUsersList');
            if (invitableUsersList) {
                invitableUsersList.innerHTML = html;
            }
        })
        .catch(err => {
            console.error("Errore nel recupero degli utenti:", err);
            alert("Impossibile caricare gli utenti. Riprova più tardi.");
        });
}

function aggiornaListe() {
    const invitableUsersList = document.getElementById("invitableUsersList");
    const invitedUsersList = document.getElementById("invitedUsersList");

    if (!invitableUsersList || !invitedUsersList) return;

    let invitableHTML = "";
    let invitedHTML = "";

    // Qui escludi direttamente l'utente loggato
    utenti.forEach(u => {
        if (utentiInvitati.includes(u.id)) {
            invitedHTML += `<div>${u.nome}</div>`;
        } else {
            invitableHTML += `
                <label>
                    <input type="checkbox" value="${u.id}" />
                    ${u.nome}
                </label><br />
            `;
        }
    });

    invitableUsersList.innerHTML = invitableHTML;
    invitedUsersList.innerHTML = invitedHTML;
}

function invitaSelezionati() {
    const checkboxes = document.querySelectorAll("#invitableUsersList input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
        alert("Seleziona almeno un utente da invitare.");
        return;
    }

    // Contatore per tenere traccia degli inviti inviati con successo
    let invitiInviati = 0;

    checkboxes.forEach(cb => {
        const destinatarioId = parseInt(cb.value);

        const now = new Date();

        // Estrai anno, mese, giorno, ore, minuti e secondi
        const anno = now.getFullYear();
        const mese = String(now.getMonth() + 1).padStart(2, '0'); // Mesi partono da 0
        const giorno = String(now.getDate()).padStart(2, '0');
        const ore = String(now.getHours()).padStart(2, '0');
        const minuti = String(now.getMinutes()).padStart(2, '0');
        const secondi = String(now.getSeconds()).padStart(2, '0');

        // Formatta la data nel formato MySQL (YYYY-MM-DD HH:mm:ss)
        const dataCorretta = `${anno}-${mese}-${giorno} ${ore}:${minuti}:${secondi}`;
        console.log(dataCorretta);

        const invito = {
            evento_id: selectedEventoId,
            mittente_id: parseInt(utenteLoggatoId),
            destinatario_id: destinatarioId,
            stato: "inviato",
            data: dataCorretta
        };

        fetch("/invito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invito)
        })
            .then(res => res.json())
            .then(data => {
                if (data.result === "ok") {
                    utentiInvitati.push(destinatarioId);
                    invitiInviati++; // Incrementa il contatore degli inviti inviati

                    // Aggiorna le liste solo se tutti gli inviti sono stati processati
                    if (invitiInviati === checkboxes.length) {
                        aggiornaListe();
                        alert(`Inviti inviati con successo! (${invitiInviati} utenti invitati)`); // Alert di conferma
                    }
                } else {
                    alert("Errore: " + data.error);
                }
            })
            .catch(err => {
                console.error("Errore durante l'invio dell'invito:", err);
                alert("Impossibile inviare l'invito. Riprova più tardi.");
            });
    });
}

function caricaEventiDisponibili() {
    fetch('/eventi')
        .then(res => res.json())
        .then(eventi => {
            const selector = document.getElementById("eventoSelector");

            if (!selector) return;

            eventi.forEach(evento => {
                const option = document.createElement("option");
                option.value = evento.id;
                option.textContent = evento.titolo;
                selector.appendChild(option);
            });

            selector.onchange = function () {
                const eventoId = parseInt(this.value);
                if (!eventoId) return;

                inizializzaInviti(eventoId, utenteLoggatoId);
            };
        })
        .catch(err => {
            console.error("Errore nel caricamento degli eventi:", err);
            alert("Impossibile caricare gli eventi. Riprova più tardi.");
        });
}

function caricaInvitiRicevuti() {
    const userId = utenteLoggatoId;

    if (!userId) return;

    const listaInviti = document.getElementById('listaInvitiRicevuti');
    if (!listaInviti) return;

    listaInviti.innerHTML = 'Caricamento inviti...';
    listaInviti.classList.remove('hidden');

    fetch(`/inviti/${userId}`) 
        .then(res => res.json())
        .then(inviti => {
            listaInviti.innerHTML = '';

            const invitiAttivi = inviti.filter(inv => inv.stato === "inviato");

            if (invitiAttivi.length === 0) {
                listaInviti.innerHTML = 'Non hai inviti ricevuti.';
                return;
            }

            let htmlInviti = '';  // Variabile per costruire l'HTML dei singoli inviti

            invitiAttivi.forEach(invito => {
                fetch(`/evento/${invito.evento_id}`)
                    .then(res => res.json())
                    .then(evento => {
                        htmlInviti += `
                            <div class="invito">
                                <h4>${evento.titolo}</h4>
                                <p>Data Evento: ${new Date(evento.data).toLocaleDateString()}</p>
                                <p>Stato: ${invito.stato}</p>
                                <p>Data Invito: ${new Date(invito.data).toLocaleString()}</p>
                                <p>Invitato da: ${invito.mittente_nome || "Sconosciuto"}</p>
                                <button class="partecipaBtn" data-id="${evento.id}">Partecipa</button>
                                <button class="annullaInvitoBtn" data-id="${invito.id}">Annulla Invito</button>
                            </div>
                        `;
                        
                        // Associa gli eventi dopo aver aggiunto l'HTML
                        listaInviti.innerHTML = htmlInviti;

                        // Impostiamo il comportamento dei bottoni solo dopo aver aggiornato l'HTML
                        listaInviti.querySelectorAll('.partecipaBtn').forEach(button => {
                            button.onclick = () => {
                                partecipaEvento(button.getAttribute('data-id'), userId);
                            };
                        });

                        listaInviti.querySelectorAll('.annullaInvitoBtn').forEach(button => {
                            button.onclick = () => {
                                rifiutaInvito(button.getAttribute('data-id'));
                            };
                        });

                    })
                    .catch(err => console.error("Errore nel recupero evento:", err));
            });
        })
        .catch(err => {
            console.error("Errore nel recupero inviti:", err);
            alert("Impossibile caricare gli inviti.");
        });
}



function partecipaEvento(eventoId, userId) {
    
    fetch(`/invito`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            evento_id: eventoId,
            utente_destinatario_id: userId,
            stato: "accettato"
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Risposta partecipazione evento:", data);
        if (data.result === "ok") {
            console.log("do: ",userId);
            console.log("do: ",eventoId);
            return fetch(`/evento/${eventoId}/partecipa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_utente: userId ,partecipa: true })
            });
        } else {
            throw new Error("Errore nell'accettazione dell'invito");
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("Response:", data);
        if (data.success) {
            alert("Hai accettato l'invito e sei stato aggiunto all'evento.");
            caricaInvitiRicevuti();
        } else {
            alert("Errore durante la partecipazione all'evento.");
        }
    })
    .catch(err => {
        console.error("Errore durante l'accettazione/partecipazione:", err);
    });
}




function rifiutaInvito(invitoId) {
    fetch(`/invito`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            evento_id: selectedEventoId,
            utente_destinatario_id: utenteLoggatoId,
            stato: "rifiutato"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "ok") {
            alert("Hai rifiutato l'invito.");
            caricaInvitiRicevuti();
        } else {
            alert("Errore nel rifiutare l'invito.");
        }
    })
    .catch(err => {
        console.error("Errore nel rifiutare l'invito:", err);
        alert("Impossibile rifiutare l'invito. Riprova più tardi.");
    });
}




window.onload = function () {

    
    const eventoSelector = document.getElementById("eventoSelector");
    if (eventoSelector) {
        caricaEventiDisponibili(); 
    }

    const invitaBtn = document.getElementById("invitaBtn");
    if (invitaBtn) {
        invitaBtn.onclick = invitaSelezionati;
    }

    if (eventoSelector) {
        eventoSelector.onchange = function () {
            const eventoId = parseInt(this.value);
            if (!eventoId) return;
            inizializzaInviti(eventoId, utenteLoggatoId);
        };
    }
};