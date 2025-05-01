// Funzione per caricare gli eventi dal server e visualizzarli
function caricaEventi() {
    fetch('/eventi')
        .then(response => response.json())
        .then(data => {
            // Supponiamo che tu abbia un elemento HTML con l'id 'eventi-list' dove mostrare gli eventi
            const eventiList = document.getElementById('eventi-list');
            eventiList.innerHTML = ""; // Pulisce la lista

            data.forEach(evento => {
                const eventoItem = document.createElement('div');
                eventoItem.classList.add('evento');

                eventoItem.innerHTML = `
                    <h3>${evento.titolo}</h3>
                    <p>${evento.descrizione}</p>
                    <p>${evento.data}</p>
                    <button onclick="modificaEvento(${evento.id})">Modifica</button>
                    <button onclick="eliminaEvento(${evento.id})">Elimina</button>
                `;

                eventiList.appendChild(eventoItem);
            });
        })
        .catch(err => console.error("Errore nel caricamento degli eventi:", err));
}

// Funzione per modificare un evento
function modificaEvento(eventoId) {
    // Mostra un form o una finestra di dialogo con i dati dell'evento precompilati
    const nuovoTitolo = prompt("Nuovo titolo:");
    const nuovaDescrizione = prompt("Nuova descrizione:");
    const nuovaData = prompt("Nuova data:");

    fetch(`/evento/${eventoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            titolo: nuovoTitolo,
            descrizione: nuovaDescrizione,
            data: nuovaData
        })
    }).then(response => response.json())
      .then(data => {
          if (data.result === "ok") {
              alert("Evento modificato!");
              // Ricarica gli eventi per mostrare la modifica
              caricaEventi();
          }
      }).catch(err => console.error("Errore durante la modifica dell'evento:", err));
}

// Funzione per eliminare un evento
function eliminaEvento(eventoId) {
    if (confirm("Sei sicuro di voler eliminare questo evento?")) {
        fetch(`/evento/${eventoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => response.json())
          .then(data => {
              if (data.result === "ok") {
                  alert("Evento eliminato!");
                  // Ricarica gli eventi per rimuovere l'evento eliminato
                  caricaEventi();
              }
          }).catch(err => console.error("Errore durante l'eliminazione dell'evento:", err));
    }
}



