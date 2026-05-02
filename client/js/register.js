const form = document.getElementById("register-form");
const registerMessage = document.getElementById("error-message");

function showMessage(message, isError = true) {
  registerMessage.textContent = message;
  registerMessage.style.color = isError ? "#fca5a5" : "#86efac";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  showMessage("");

  if (!login || !password) {
    showMessage("Заповни всі поля.");
    return;
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ login, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Помилка реєстрації.");
      return;
    }

    showMessage("Реєстрація успішна!", false);

    setTimeout(() => {
      window.location.href = "/login";
    }, 700);

  } catch {
    showMessage("Помилка сервера.");
  }
});