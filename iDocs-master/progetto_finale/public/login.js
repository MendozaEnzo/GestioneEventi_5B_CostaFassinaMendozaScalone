export const createLogin = () => {
  const inputName = document.querySelector("#user");     // username
  const inputPassword = document.querySelector("#psw");  // password
  const loginButton = document.getElementById("loginBtn");
  const loginLink = document.querySelector('.nav-right a[href="#login"]'); // Link login nella navbar
  const dashboardButton = document.getElementById("dashboardBtn"); // Pulsante dashboard
  const logoutButton = document.getElementById("logoutBtn"); // Pulsante logout
  const esitoLog = document.getElementById("esitoLog");
  const loginModal = document.getElementById("loginModal");
  let isLogged = false;

  // Logica di login
  loginButton.onclick = () => {
    const nome = inputName.value;
    const password = inputPassword.value;

    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, password })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Credenziali errate");
        }
        return res.json();
      })
      .then(utente => {
        // Login riuscito
        isLogged = true;

        // Nascondi la modale di login e rimuovi il backdrop
        loginModal.classList.add("hidden");
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();

        // Nascondi il link del login nella navbar
        if (loginLink) {
          loginLink.style.display = "none"; // Nascondi il link del login
        }

        // Aggiorna l'interfaccia con il logout e la dashboard
        alert("Benvenuto, " + utente.nome + "!");
        loginButton.style.display = "none"; // Nascondi il pulsante login
        logoutButton.style.display = "block"; // Mostra il pulsante logout
        dashboardButton.style.display = "block"; // Mostra il pulsante dashboard
        localStorage.setItem("utente", JSON.stringify(utente)); // Salva utente in localStorage
        sessionStorage.setItem("userId", utente.id);
      })
      .catch(error => {
        console.error("Errore durante il login:", error);
        esitoLog.innerHTML =
          '<div class="alert alert-danger">Credenziali errate!</div>';
      });
  };

  // Logica per il logout
  if (logoutButton) {
    logoutButton.onclick = () => {
      localStorage.removeItem("utente"); // Rimuovi l'utente dalla sessione
      isLogged = false;

      // Mostra nuovamente il pulsante login e nascondi gli altri
      if (loginLink) loginLink.style.display = "block"; // Mostra il link del login
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
      dashboardButton.style.display = "none";
      alert("Sei uscito dall'account.");
      window.location.href = "#homepage"; // Torna alla homepage
    };
  }

  // Pulsante per andare alla dashboard
  if (dashboardButton) {
    dashboardButton.onclick = () => {
      window.location.href = "#dashboard"; // Vai alla pagina della dashboard
    };
  }

  return {
    isLogged: () => isLogged
  };
};






function openRegisterModal() {
  // Nascondi il modal di login
  const loginModal = document.getElementById("loginModal");
  loginModal.classList.add("hidden");

  // Mostra il modal di registrazione
  const registerModal = document.getElementById("registerModal");
  registerModal.classList.remove("hidden");
}

// Funzione per chiudere il modal di registrazione e tornare al login
function closeRegisterModal() {
  // Nascondi il modal di registrazione
  const registerModal = document.getElementById("registerModal");
  registerModal.classList.add("hidden");

  // Mostra il modal di login
  const loginModal = document.getElementById("loginModal");
  loginModal.classList.remove("hidden");
}

const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.onclick = registraUtente;
}

function registraUtente() {
  const nome = document.getElementById("newUser").value;
  const email = document.getElementById("newEmail").value;
  const password = document.getElementById("newPassword").value;

  if (!nome || !email || !password) {
    alert("Compila tutti i campi!");
    return;
  }

  fetch("/utente", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.result === "ok") {
        alert("Registrazione completata!");
        closeRegisterModal();
      } else {
        alert("Errore nella registrazione: " + (data.message || "Dati non validi."));
      }
    })
    .catch(err => {
      console.error("Errore nella registrazione:", err);
      alert("Errore durante la registrazione");
    });
}

// Aggiungi l'evento di clic al link di registrazione
const registerLink = document.getElementById("register-link");
if (registerLink) {
  registerLink.onclick = function(event) {
    event.preventDefault(); // Prevenire il comportamento predefinito del link
    openRegisterModal(); // Apri il modal di registrazione
  };
}

// Aggiungi la logica per chiudere il modal di registrazione
const closeRegisterBtn = document.getElementById("closeRegister");
if (closeRegisterBtn) {
  closeRegisterBtn.onclick = closeRegisterModal;
}
