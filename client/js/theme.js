(function () {
  const STORAGE_KEY = "qr_theme";
  const root = document.documentElement;

  function getCurrentTheme() {
    return localStorage.getItem(STORAGE_KEY) || "neon";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "✨ Неонова тема" : "🌙 Темна тема";
    }
  }

  function toggleTheme() {
    const nextTheme = getCurrentTheme() === "dark" ? "neon" : "dark";
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  applyTheme(getCurrentTheme());

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getCurrentTheme());

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", toggleTheme);
    }
  });
})();