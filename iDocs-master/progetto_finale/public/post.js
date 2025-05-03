// Funzione per aprire la modale "Aggiungi Post"
const aggiungiPostBtn = document.getElementById('aggiungiPostBtn');
if (aggiungiPostBtn) {
  aggiungiPostBtn.onclick = () => {
    // Rende visibile la modale per aggiungere il post
    document.getElementById('aggiungiPostModal').classList.remove('hidden');

    // Mostra solo la sezione per tipo/data, nascondi quella contenuto
    document.getElementById('postInfoSection').classList.remove('hidden');
    document.getElementById('postContentSection').classList.add('hidden');
    
    // Pulisce i campi tipo e data
    document.getElementById('postTipo').value = '';
    document.getElementById('postData').value = '';
  };
}

// Funzione per salvare le informazioni di tipo e data del post
const savePostInfoBtn = document.getElementById('savePostInfoBtn');
if (savePostInfoBtn) {
  savePostInfoBtn.onclick = async () => {
    const postTipo = document.getElementById('postTipo').value.trim();
    const postData = document.getElementById('postData').value.trim();

    if (!postTipo || !postData) {
      alert('Compila tutti i campi della sezione Info.');
      return;
    }

    // Al salvataggio delle info, nascondi la sezione tipo/data e mostra quella contenuto
    document.getElementById('postInfoSection').classList.add('hidden');
    document.getElementById('postContentSection').classList.remove('hidden');
  };
}

// Funzione per salvare il contenuto del post (titolo e URL)
const savePostContentBtn = document.getElementById('savePostContentBtn');
if (savePostContentBtn) {
  savePostContentBtn.onclick = async () => {
    const contentTitle = document.getElementById('contentTitle').value.trim();
    const postContent = document.getElementById('postContent').value.trim();

    // Se titolo o URL sono vuoti, mostra un avviso
    if (!contentTitle || !postContent) {
      alert('Compila titolo e URL del contenuto.');
      return;
    }

    // Ottenere l'ID dell'utente loggato
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('Devi essere loggato per aggiungere un post.');
      return;
    }

    // Recupera le informazioni del tipo e della data dal primo step
    const postTipo = document.getElementById('postTipo').value;
    const postData = document.getElementById('postData').value;

    // Aggiungi il post tramite un POST request al backend
    try {
      const res = await fetch('/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: postTipo,
          data_post: new Date(postData).toISOString(),
          autore_id: parseInt(userId, 10),
          titolo: contentTitle,
          url: postContent
        })
      });
      const result = await res.json();

      if (result.result === 'ok') {
        alert('Post aggiunto con successo!');
        document.getElementById('aggiungiPostModal').classList.add('hidden');
      } else {
        alert('Errore nell\'aggiunta del post.');
      }
    } catch (err) {
      console.error('Errore aggiunta post:', err);
      alert('Errore durante l\'aggiunta del post.');
    }
  };
}

// Funzione per chiudere la modale
const closeModal = document.getElementById('closeModal');
if (closeModal) {
  closeModal.onclick = () => {
    document.getElementById('aggiungiPostModal').classList.add('hidden');
  };
}

// Funzione per caricare i post associati a un evento
export async function caricaPostEvento(eventoId) {
  const container = document.getElementById('postList');
  if (!container) return;

  try {
    const response = await fetch(`/post/evento/${eventoId}`);
    if (!response.ok) throw new Error('Errore nel recupero dei post');
    const posts = await response.json();

    if (posts.length === 0) {
      container.innerHTML = '<p>Nessun post ancora.</p>';
    } else {
      container.innerHTML = posts.map(p => `
        <div class="post">
          <p><strong>${p.autore_id}</strong> (${new Date(p.data_post).toLocaleString()})</p>
          <p>${p.tipo === 'text' ? p.testo : ''}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Errore caricamento post:', err);
    container.innerHTML = '<p>Errore nel caricamento dei post.</p>';
  }
}
// Funzione per aggiungere un post
export async function aggiungiPost(eventoId) {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('Devi essere loggato per aggiungere un post.');
      return;
    }
  
    // Mostra il modale
    const modal = document.getElementById('aggiungiPostModal');
    modal.classList.remove('hidden');
  
    const postTipoInput = document.getElementById('postTipo');
    const postDataInput = document.getElementById('postData');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const postContentSection = document.getElementById('postContentSection');
    const savePostContentBtn = document.getElementById('savePostContentBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
  
    // Passaggio alla seconda parte del form (contenuto)
    nextStepBtn.onclick = () => {
      const postTipo = postTipoInput.value.trim();
      const postData = postDataInput.value.trim();
  
      if (!postTipo || !isValidDate(postData)) {
        alert('Inserisci un tipo valido e una data valida del post.');
        return;
      }
  
      // Nascondi la sezione tipo/data e mostra quella del contenuto
      document.getElementById('postInfoSection').classList.add('hidden');
      document.getElementById('postContentSection').classList.remove('hidden');
  
      // Salva il tipo e la data nel sessionStorage
      sessionStorage.setItem('postTipo', postTipo);
      sessionStorage.setItem('postData', postData);
    };
  
    // Salvataggio del contenuto del post
    savePostContentBtn.onclick = async () => {
      const contentTitle = document.getElementById('contentTitle').value.trim();
      const postContent = document.getElementById('postContent').value.trim();
  
      if (!contentTitle || !postContent) {
        alert('Compila titolo e URL del contenuto.');
        return;
      }
  
      try {
        const postTipo = sessionStorage.getItem('postTipo');
        const postData = sessionStorage.getItem('postData');
  
        // Aggiungi il post tramite una richiesta POST al backend
        const res = await fetch('/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: postTipo,
            data_post: new Date(postData).toISOString(),
            autore_id: parseInt(userId, 10),
            evento_id: eventoId,
            titolo: contentTitle,
            url: postContent
          })
        });
  
        const result = await res.json();
  
        if (result.result === 'ok') {
          alert('Post aggiunto con successo!');
          modal.classList.add('hidden');
        } else {
          alert('Errore nell\'aggiunta del post.');
        }
      } catch (err) {
        console.error('Errore aggiunta post:', err);
        alert('Errore durante l\'aggiunta del post.');
      }
    };
  
    // Chiudi il modale
    closeModalBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
  
  // Funzione per validare la data (formato YYYY-MM-DD)
  function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  }
  
  
