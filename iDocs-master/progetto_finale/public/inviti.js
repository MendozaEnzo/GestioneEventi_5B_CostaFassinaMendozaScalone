let selectedEventoId = null;
let utenteLoggatoId = null;
let utenti = [];
let utentiInvitati = [];


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

            const listaUtentiInvitabili = utenti.filter(utente => utente.id !== utenteLoggatoId);

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

    utenti.forEach(u => {
        if (u.id === utenteLoggatoId) return;

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

    checkboxes.forEach(cb => {
        const destinatarioId = parseInt(cb.value);

        const dataInvito = new Date().toISOString().slice(0, 19).replace("T", " ");
        const invito = {
            evento_id: selectedEventoId,
            mittente_id: utenteLoggatoId,
            destinatario_id: destinatarioId,
            stato: "inviato",
            data: dataInvito
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
                    aggiornaListe();
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

    fetch(`/inviti?utente_id=${userId}`)
        .then(res => res.json())
        .then(inviti => {
            const listaInviti = document.getElementById('listaInvitiRicevuti');

            if (!listaInviti) return;

            listaInviti.innerHTML = ''; 
            listaInviti.classList.remove('hidden');

            if (inviti.length === 0) {
                listaInviti.innerHTML = 'Non hai inviti ricevuti.';
                return;
            }

            inviti.forEach(invito => {
                fetch(`/evento/${invito.evento_id}`)
                    .then(res => res.json())
                    .then(evento => {
                        const divInvito = document.createElement('div');
                        divInvito.classList.add('invito');
                        divInvito.innerHTML = `
                            <h4>${evento.titolo}</h4>
                            <p>Data Evento: ${new Date(evento.data).toLocaleDateString()}</p>
                            <p>Invitato: ${invito.destinatario_nome}</p>
                            <p>Stato: ${invito.stato}</p>
                            <p>Data Invito: ${new Date(invito.data).toLocaleString()}</p>
                            <button class="partecipaBtn" data-id="${invito.evento_id}">Partecipa</button>
                            <button class="annullaInvitoBtn" data-id="${invito.id}">Annulla Invito</button>
                        `;
                        listaInviti.appendChild(divInvito);

                        divInvito.querySelector('.partecipaBtn').onclick = () => {
                            partecipaEvento(invito.evento_id, userId);
                        };

                        divInvito.querySelector('.annullaInvitoBtn').onclick = () => {
                            annullaInvito(invito.id);
                        };
                    })
                    .catch(err => console.error("Errore nel recupero dell'evento:", err));
            });
        })
        .catch(err => {
            console.error("Errore nel recupero degli inviti:", err);
            alert("Impossibile caricare gli inviti ricevuti. Riprova più tardi.");
        });
}


function partecipaEvento(eventoId, userId) {
    fetch(`/evento/${eventoId}/partecipa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, partecipa: true })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Sei stato aggiunto all'evento!");
                caricaInvitiRicevuti(); 
            } else {
                alert("Errore durante la partecipazione.");
            }
        })
        .catch(err => console.error("Errore durante la partecipazione:", err));
}

function annullaInvito(invitoId) {
    fetch(`/invito/${invitoId}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Invito annullato.");
                caricaInvitiRicevuti();  
            } else {
                alert("Errore nell'annullare l'invito.");
            }
        })
        .catch(err => console.error("Errore nell'annullare l'invito:", err));
}

window.onload = function () {
    const invitaBtn = document.getElementById("invitaBtn");
    if (invitaBtn) {
        invitaBtn.onclick = invitaSelezionati;
    }

    const eventoSelector = document.getElementById("eventoSelector");
    if (eventoSelector) {
        eventoSelector.onchange = function () {
            const eventoId = parseInt(this.value);
            if (!eventoId) return;
            inizializzaInviti(eventoId, utenteLoggatoId);
        };
    }

    caricaEventiDisponibili();
};