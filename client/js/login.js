const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageEl = document.getElementById("error-message");

function showMessage(message, isError = true) {
  messageEl.textContent = message;
  messageEl.style.color = isError ? "#fca5a5" : "#86efac";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = emailInput.value.trim();
  const password = passwordInput.value.trim();

  showMessage("");

  if (!login || !password) {
    showMessage("Заповни всі поля.");
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        login,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Помилка входу.");
      return;
    }

    showMessage("Успішний вхід. Перенаправлення...", false);

    setTimeout(() => {
      window.location.href = "/";
    }, 500);

  } catch {
    showMessage("Помилка сервера.");
  }
});