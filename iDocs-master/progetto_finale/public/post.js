
const closeModal = document.getElementById('closeModal');
if (closeModal) {
  closeModal.onclick = () => {
    document.getElementById('aggiungiPostModal').classList.add('hidden');
  };
}


export async function caricaPostEvento(eventoId) {
  const container = document.getElementById('postList');
  if (!container) return;

  try {
    const response = await fetch(`/post/evento/${eventoId}`);
    if (!response.ok) throw new Error('Errore nel recupero dei post');
    const posts = await response.json();

    container.innerHTML = ''; 

    if (posts.length === 0) {
      container.innerHTML = '<p>Nessun post ancora.</p>';
    } else {
      let postsHtml = ''; 

    posts.forEach(post => {
      
      let contentHtml = '';

      
      if (post.url.match(/\.(jpeg|jpg|gif|png)$/)) {
        contentHtml = `<img src="${post.url}" alt="Contenuto immagine" style="max-width: 100%; max-height: 300px; height: auto;">`;
      }
      
      else if (post.url.match(/\.(mp4|webm|ogg)$/)) {
        contentHtml = `<video controls style="max-width: 100%; max-height: 300px;">
                        <source src="${post.url}" type="video/mp4">
                        Il tuo browser non supporta il formato video.
                      </video>`;
      }
      
      else if (post.url.match(/\.pdf$/)) {
        contentHtml = `<iframe src="${post.url}" width="100%" height="400px">Il tuo browser non supporta il visualizzatore PDF.</iframe>`;
      }
      
      else {
        contentHtml = `<a href="${post.url}" target="_blank">Scarica il file</a>`;
      }

      
      postsHtml += `
        <div class="post">
          <p><strong>Creato da:</strong> ${post.autore_nome}</p>
          <p><strong>Data:</strong> ${new Date(post.data_post).toLocaleString()}</p>
          <p><strong>Tipo:</strong> ${post.tipo}</p>
          <p><strong>Titolo:</strong> ${post.tipo_contenuto}</p>
          <p>${contentHtml}</p>
        </div>
      `;
    });


    const container = document.getElementById("postList");
    container.innerHTML = postsHtml;

    }
  } catch (err) {
    console.error('Errore caricamento post:', err);
    container.innerHTML = '<p>Errore nel caricamento dei post.</p>';
  }
}


export async function aggiungiPost(eventoId) {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    alert('Devi essere loggato per aggiungere un post.');
    return;
  }

  const modal = document.getElementById('aggiungiPostModal');
  modal.classList.remove('hidden');

  document.getElementById('postInfoSection').classList.remove('hidden');
  document.getElementById('postContentSection').classList.add('hidden');

  const nextStepBtn = document.getElementById('nextStepBtn');
  const savePostBtn = document.getElementById('savePostContentBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // creazione post
  nextStepBtn.onclick = async () => {
    const postTipo = document.getElementById('postTipo').value.trim();
    if (!postTipo) {
      alert('Inserisci un tipo valido per il post.');
      return;
    }

    // Ottieni data e ora locali senza secondi
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDataPost = `${year}-${month}-${day} ${hours}:${minutes}:00`;

    try {
      const res = await fetch('/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: postTipo,
          data_post: formattedDataPost,
          autore_id: parseInt(userId, 10),
          evento_id: eventoId,
        }),
      });

      const result = await res.json();
      console.log('Risultato dal server:', result);

      if (result.result === 'ok') {
        sessionStorage.setItem('id_post', result.id_post);
        console.log('id_post salvato in sessionStorage:', result.id_post);

        document.getElementById('postInfoSection').classList.add('hidden');
        document.getElementById('postContentSection').classList.remove('hidden');
      } else {
        alert('Errore nell\'aggiunta del post.');
      }

    } catch (err) {
      console.error('Errore aggiunta post:', err);
      alert('Errore durante l\'aggiunta del post.');
    }
  };

  // contenuto
  savePostBtn.onclick = async () => {
    const contentTitle = document.getElementById('contentTitle').value.trim();
    const fileContent = document.getElementById('fileContent').files[0];
    const idPostStr = sessionStorage.getItem('id_post');

    if (!idPostStr || isNaN(parseInt(idPostStr, 10))) {
      alert('Errore: id_post non trovato o non valido in sessionStorage.');
      console.error('id_post non valido:', idPostStr);
      return;
    }

    const idPost = parseInt(idPostStr, 10);

    if (!contentTitle || !fileContent) {
      alert('Compila titolo e carica un file per il contenuto.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileContent);
    formData.append('tipo', contentTitle);
    formData.append('id_post', idPost);

    try {
      const res = await fetch('/contenuto', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.result === 'ok') {
        alert('Contenuto caricato con successo!');
        modal.classList.add('hidden');
        caricaPostEvento(eventoId);
        caricaPostUtente();
      } else {
        alert('Errore nel caricamento del contenuto.');
      }

    } catch (err) {
      console.error('Errore upload contenuto:', err);
      alert('Errore durante il caricamento del contenuto.');
    }
  };

  closeModalBtn.onclick = () => {
    modal.classList.add('hidden');
  };
}


export async function caricaPostUtente() {
    const userId = sessionStorage.getItem("userId");
    const container = document.getElementById("listaPostUtente");
  
    if (!userId || !container) return;
  
    try {
      const res = await fetch(`/post/utente/${userId}`);
      const posts = await res.json();
  
      if (posts.length === 0) {
        container.innerHTML = "<p>Non hai ancora creato post.</p>";
      } else {
        container.innerHTML = posts.map(post => {
          let contentHtml = '';
        
          if (post.url.match(/\.(jpeg|jpg|png|gif)$/i)) {
            contentHtml = `<img src="${post.url}" alt="Immagine" style="max-width: 100%; max-height: 300px;">`;
          } else if (post.url.match(/\.(mp4|webm|ogg)$/i)) {
            contentHtml = `<video controls style="max-width: 100%; max-height: 300px;">
                             <source src="${post.url}">
                             Il tuo browser non supporta il video.
                           </video>`;
          } else if (post.url.match(/\.pdf$/i)) {
            contentHtml = `<iframe src="${post.url}" width="100%" height="400px"></iframe>`;
          } else if (post.url) {
            contentHtml = `<a href="${post.url}" target="_blank">Scarica il file</a>`;
          } else {
            contentHtml = "Nessun contenuto disponibile";
          }
        
          return `
            <div class="post-utente-container" data-post-id="${post.id}">
              <div class="post-utente">
                <p><strong>Evento:</strong> ${post.evento_titolo}</p>
                <p><strong>Tipo:</strong> ${post.tipo}</p>
                <p><strong>Data:</strong> ${new Date(post.data_post).toLocaleString()}</p>
                <p><strong>Titolo contenuto:</strong> ${post.tipo_contenuto || "—"}</p>
                <div class="contenuto">${contentHtml}</div>
              </div>
              <div class="post-utente-actions">
                <button class="elimina-post-btn" data-id="${post.id}">Elimina</button>
              </div>
            </div>
          `;
        }).join("");
        
        
        document.querySelectorAll(".elimina-post-btn").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const postId = e.target.dataset.id;
            if (confirm("Sei sicuro di voler eliminare questo post?")) {
              try {
                const delRes = await fetch(`/post/${postId}`, { method: "DELETE" });
                const result = await delRes.json();
                if (result.result === "ok") {
                  caricaPostUtente(); 
                } else {
                  alert("Errore durante l'eliminazione del post.");
                }
              } catch (err) {
                console.error("Errore nell'eliminazione:", err);
                alert("Errore durante l'eliminazione.");
              }
            }
          });
        });
  
      }
  
    } catch (err) {
      console.error("Errore nel recupero dei post utente:", err);
      container.innerHTML = "<p>Errore nel caricamento dei tuoi post.</p>";
    }
  }  


