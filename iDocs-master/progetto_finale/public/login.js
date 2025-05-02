export const createLogin = () => {
  const inputName = document.querySelector("#user");
  const inputPassword = document.querySelector("#psw");
  const loginButton = document.getElementById("loginBtn");
  const loginLink = document.querySelector('.nav-right a[href="#login"]');
  const dashboardButton = document.getElementById("dashboardBtn");
  const logoutButton = document.getElementById("logoutBtn");
  const esitoLog = document.getElementById("esitoLog");
  const loginModal = document.getElementById("loginModal");
  let isLogged = false;

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
        sessionStorage.setItem("username", utente.nome);
        sessionStorage.setItem("userId", utente.id);
        console.log("UserName memorizzato:", sessionStorage.getItem("username"));
        console.log("UserId memorizzato:", sessionStorage.getItem("userId"));
        isLogged = true;

        loginModal.classList.add("hidden");
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();

        if (loginLink) {
          loginLink.style.display = "none";
        }

        alert("Benvenuto, " + utente.nome + "!");
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
        dashboardButton.style.display = "block";
      })
      .catch(error => {
        console.error("Errore durante il login:", error);
        esitoLog.innerHTML =
          '<div class="alert alert-danger">Credenziali errate!</div>';
      });
  };

  if (logoutButton) {
    logoutButton.onclick = () => {
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userId");
      isLogged = false;
      inputName.value = "";
      inputPassword.value = "";
    
      if (loginLink) loginLink.style.display = "block";
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
      dashboardButton.style.display = "none";
      alert("Sei uscito dall'account.");
      window.location.href = "#homepage";
    };
  }

  if (dashboardButton) {
    dashboardButton.onclick = () => {
      window.location.href = "#dashboard";
    };
  }

  return {
    isLogged: () => isLogged
  };
};

function openRegisterModal() {
  const loginModal = document.getElementById("loginModal");
  loginModal.classList.add("hidden");

  const registerModal = document.getElementById("registerModal");
  registerModal.classList.remove("hidden");
}

function closeRegisterModal() {
  const registerModal = document.getElementById("registerModal");
  registerModal.classList.add("hidden");

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

  if (!nome || !email) {
    alert("Compila tutti i campi!");
    return;
  }

  fetch("/utente", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email })  // niente password
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.result === "ok") {
        alert("Registrazione completata! Controlla la tua email per la password.");
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


const registerLink = document.getElementById("register-link");
if (registerLink) {
  registerLink.onclick = function(event) {
    event.preventDefault();
    openRegisterModal();
  };
}

const closeRegisterBtn = document.getElementById("closeRegister");
if (closeRegisterBtn) {
  closeRegisterBtn.onclick = closeRegisterModal;
}
