import { QrStrategyFactory } from "./factories/QrStrategyFactory.js";
import { SocialQrStrategy } from "./generators/SocialQrStrategy.js";
import { QrCanvasRenderer } from "./renderers/QrCanvasRenderer.js";
import { escapeHtml } from "./utils/htmlUtils.js";
import { formatDate } from "./utils/dateUtils.js";

const qrTypeSelect = document.getElementById("qr-type");

const qrInput = document.getElementById("qr-input");
const qrTitleInput = document.getElementById("qr-title");

const wifiSsidInput = document.getElementById("wifi-ssid");
const wifiPasswordInput = document.getElementById("wifi-password");
const wifiSecurityInput = document.getElementById("wifi-security");
const wifiHiddenInput = document.getElementById("wifi-hidden");

const emailAddressInput = document.getElementById("email-address");
const emailSubjectInput = document.getElementById("email-subject");
const emailBodyInput = document.getElementById("email-body");
const emailCcInput = document.getElementById("email-cc");

const phoneNumberInput = document.getElementById("phone-number");
const textContentInput = document.getElementById("text-content");

const vcardFirstNameInput = document.getElementById("vcard-first-name");
const vcardLastNameInput = document.getElementById("vcard-last-name");
const vcardPhoneInput = document.getElementById("vcard-phone");
const vcardEmailInput = document.getElementById("vcard-email");
const vcardCompanyInput = document.getElementById("vcard-company");
const vcardWebsiteInput = document.getElementById("vcard-website");
const vcardJobTitleInput = document.getElementById("vcard-title-job");

const smsPhoneInput = document.getElementById("sms-phone");
const smsMessageInput = document.getElementById("sms-message");

const geoLatInput = document.getElementById("geo-lat");
const geoLngInput = document.getElementById("geo-lng");
const geoLabelInput = document.getElementById("geo-label");
const geoLocateBtn = document.getElementById("geo-locate-btn");

const eventNameInput = document.getElementById("event-name");
const eventLocationInput = document.getElementById("event-location");
const eventDescInput = document.getElementById("event-desc");
const eventStartInput = document.getElementById("event-start");
const eventEndInput = document.getElementById("event-end");

const socialNetworkSelect = document.getElementById("social-network");
const socialUsernameInput = document.getElementById("social-username");
const socialPreviewLink = document.getElementById("social-preview-link");

const wifiShowPasswordBtn = document.getElementById("wifi-show-password-btn");

const darkColorInput = document.getElementById("dark-color");
const lightColorInput = document.getElementById("light-color");
const qrSizeInput = document.getElementById("qr-size");
const qrMarginInput = document.getElementById("qr-margin");
const qrSizeValue = document.getElementById("qr-size-value");
const qrMarginValue = document.getElementById("qr-margin-value");
const logoInput = document.getElementById("logo-input");

const saveBtn = document.getElementById("save-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const resetStyleBtn = document.getElementById("reset-style-btn");

const errorMessage = document.getElementById("error-message");
const qrWrapper = document.getElementById("qr-wrapper");
const qrCanvas = document.getElementById("qr-canvas");

const historyList = document.getElementById("history-list");
const authWarning = document.getElementById("auth-warning");
const userInfo = document.getElementById("user-info");
const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");
const logoutBtn = document.getElementById("logout-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");

const typePanels = {
  url: document.getElementById("panel-url"),
  wifi: document.getElementById("panel-wifi"),
  email: document.getElementById("panel-email"),
  phone: document.getElementById("panel-phone"),
  text: document.getElementById("panel-text"),
  vcard: document.getElementById("panel-vcard"),
  sms: document.getElementById("panel-sms"),
  geo: document.getElementById("panel-geo"),
  vevent: document.getElementById("panel-vevent"),
  social: document.getElementById("panel-social"),
};

let currentUser = null;
let currentLogoDataUrl = null;
let lastGeneratedConfig = null;
let previewDebounce = null;

const qrRenderer = new QrCanvasRenderer(document.getElementById("qr-canvas"));

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function updateRangeLabels() {
  qrSizeValue.textContent = `${qrSizeInput.value} px`;
  qrMarginValue.textContent = `${qrMarginInput.value}`;
}

function setActiveTypePanel(type) {
  Object.entries(typePanels).forEach(([key, panel]) => {
    if (!panel) return;

    if (key === type) {
      panel.classList.remove("hidden");
      panel.classList.add("active");
    } else {
      panel.classList.add("hidden");
      panel.classList.remove("active");
    }
  });
}

function getSafeMargin(rawMargin, hasLogo) {
  const margin = Number(rawMargin) || 0;
  if (!hasLogo) return margin;
  return Math.min(margin, 1);
}

function collectFormData() {
  return {
    url: qrInput.value.trim(),
    ssid: wifiSsidInput.value.trim(),
    password: wifiPasswordInput.value.trim(),
    security: wifiSecurityInput.value,
    hidden: wifiHiddenInput.checked,
    email: emailAddressInput.value.trim(),
    emailCc: emailCcInput ? emailCcInput.value.trim() : "",
    emailSubject: emailSubjectInput.value.trim(),
    emailBody: emailBodyInput.value.trim(),
    phone: phoneNumberInput.value.trim(),
    text: textContentInput.value.trim(),
    vcardFirstName: vcardFirstNameInput ? vcardFirstNameInput.value.trim() : "",
    vcardLastName: vcardLastNameInput ? vcardLastNameInput.value.trim() : "",
    vcardPhone: vcardPhoneInput ? vcardPhoneInput.value.trim() : "",
    vcardEmail: vcardEmailInput ? vcardEmailInput.value.trim() : "",
    vcardCompany: vcardCompanyInput ? vcardCompanyInput.value.trim() : "",
    vcardWebsite: vcardWebsiteInput ? vcardWebsiteInput.value.trim() : "",
    vcardJobTitle: vcardJobTitleInput ? vcardJobTitleInput.value.trim() : "",
    smsPhone: smsPhoneInput ? smsPhoneInput.value.trim() : "",
    smsMessage: smsMessageInput ? smsMessageInput.value.trim() : "",
    geoLat: geoLatInput ? geoLatInput.value.trim() : "",
    geoLng: geoLngInput ? geoLngInput.value.trim() : "",
    geoLabel: geoLabelInput ? geoLabelInput.value.trim() : "",
    eventName: eventNameInput ? eventNameInput.value.trim() : "",
    eventLocation: eventLocationInput ? eventLocationInput.value.trim() : "",
    eventDesc: eventDescInput ? eventDescInput.value.trim() : "",
    eventStart: eventStartInput ? eventStartInput.value : "",
    eventEnd: eventEndInput ? eventEndInput.value : "",
    socialNetwork: socialNetworkSelect ? socialNetworkSelect.value : "telegram",
    socialUsername: socialUsernameInput ? socialUsernameInput.value.trim() : "",
  };
}

function applyFormData(fields) {
  if ("url" in fields) qrInput.value = fields.url;
  if ("ssid" in fields) wifiSsidInput.value = fields.ssid;
  if ("password" in fields) wifiPasswordInput.value = fields.password;
  if ("security" in fields) wifiSecurityInput.value = fields.security;
  if ("hidden" in fields) wifiHiddenInput.checked = Boolean(fields.hidden);
  if ("email" in fields) emailAddressInput.value = fields.email;
  if ("emailCc" in fields && emailCcInput) emailCcInput.value = fields.emailCc;
  if ("emailSubject" in fields) emailSubjectInput.value = fields.emailSubject;
  if ("emailBody" in fields) emailBodyInput.value = fields.emailBody;
  if ("phone" in fields) phoneNumberInput.value = fields.phone;
  if ("text" in fields) textContentInput.value = fields.text;
  if ("vcardFirstName" in fields && vcardFirstNameInput) vcardFirstNameInput.value = fields.vcardFirstName;
  if ("vcardLastName" in fields && vcardLastNameInput) vcardLastNameInput.value = fields.vcardLastName;
  if ("vcardPhone" in fields && vcardPhoneInput) vcardPhoneInput.value = fields.vcardPhone;
  if ("vcardEmail" in fields && vcardEmailInput) vcardEmailInput.value = fields.vcardEmail;
  if ("vcardCompany" in fields && vcardCompanyInput) vcardCompanyInput.value = fields.vcardCompany;
  if ("vcardJobTitle" in fields && vcardJobTitleInput) vcardJobTitleInput.value = fields.vcardJobTitle;
  if ("vcardWebsite" in fields && vcardWebsiteInput) vcardWebsiteInput.value = fields.vcardWebsite;
  if ("smsPhone" in fields && smsPhoneInput) smsPhoneInput.value = fields.smsPhone;
  if ("smsMessage" in fields && smsMessageInput) smsMessageInput.value = fields.smsMessage;
  if ("geoLat" in fields && geoLatInput) geoLatInput.value = fields.geoLat;
  if ("geoLng" in fields && geoLngInput) geoLngInput.value = fields.geoLng;
  if ("geoLabel" in fields && geoLabelInput) geoLabelInput.value = fields.geoLabel;
  if ("eventName" in fields && eventNameInput) eventNameInput.value = fields.eventName;
  if ("eventLocation" in fields && eventLocationInput) eventLocationInput.value = fields.eventLocation;
  if ("eventDesc" in fields && eventDescInput) eventDescInput.value = fields.eventDesc;
  if ("eventStart" in fields && eventStartInput) eventStartInput.value = fields.eventStart;
  if ("eventEnd" in fields && eventEndInput) eventEndInput.value = fields.eventEnd;
  if ("socialNetwork" in fields && socialNetworkSelect) socialNetworkSelect.value = fields.socialNetwork;
  if ("socialUsername" in fields && socialUsernameInput) socialUsernameInput.value = fields.socialUsername;
}

if (wifiShowPasswordBtn) {
  wifiShowPasswordBtn.addEventListener("click", function () {
    const isHidden = wifiPasswordInput.type === "password";
    wifiPasswordInput.type = isHidden ? "text" : "password";
    wifiShowPasswordBtn.textContent = isHidden ? "Сховати" : "Показати";
  });
}

if (geoLocateBtn) {
  geoLocateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      alert("Ваш браузер не підтримує геолокацію.");
      return;
    }

    geoLocateBtn.textContent = "Визначаю...";
    geoLocateBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      function (position) {
        geoLatInput.value = position.coords.latitude.toFixed(6);
        geoLngInput.value = position.coords.longitude.toFixed(6);
        geoLocateBtn.textContent = "📍 Моя локація";
        geoLocateBtn.disabled = false;
        schedulePreviewUpdate();
      },
      function () {
        alert("Не вдалося визначити локацію. Перевірте дозволи браузера.");
        geoLocateBtn.textContent = "📍 Моя локація";
        geoLocateBtn.disabled = false;
      }
    );
  });
}

function updateSocialPreview() {
  if (!socialNetworkSelect || !socialUsernameInput || !socialPreviewLink) return;
  const url = SocialQrStrategy.getSocialUrl(socialNetworkSelect.value, socialUsernameInput.value);
  socialPreviewLink.textContent = url || "—";
  socialPreviewLink.href = url || "#";
}

if (socialNetworkSelect) {
  socialNetworkSelect.addEventListener("change", function () {
    updateSocialPreview();
    schedulePreviewUpdate();
  });
}

if (socialUsernameInput) {
  socialUsernameInput.addEventListener("input", function () {
    updateSocialPreview();
    schedulePreviewUpdate();
  });
}

function getQrConfig() {
  const hasLogo = Boolean(currentLogoDataUrl);
  const qrType = qrTypeSelect.value;
  const strategy = QrStrategyFactory.getStrategy(qrType);
  const formData = collectFormData();
  const typeData = strategy.buildPayload(formData);

  return {
    qrType,
    url: typeData.payload,
    displayValue: typeData.displayValue,
    title: qrTitleInput.value.trim(),
    darkColor: darkColorInput.value,
    lightColor: lightColorInput.value,
    size: Number(qrSizeInput.value),
    margin: getSafeMargin(Number(qrMarginInput.value), hasLogo),
    requestedMargin: Number(qrMarginInput.value),
    logoDataUrl: currentLogoDataUrl,
  };
}

function clearQr() {
  qrRenderer.clear();
  qrWrapper.classList.add("hidden");
  lastGeneratedConfig = null;
}

function clearTypeFields() {
  qrInput.value = "";

  wifiSsidInput.value = "";
  wifiPasswordInput.value = "";
  wifiSecurityInput.value = "WPA";
  wifiHiddenInput.checked = false;

  emailAddressInput.value = "";
  emailSubjectInput.value = "";
  emailBodyInput.value = "";
  if (emailCcInput) emailCcInput.value = "";

  phoneNumberInput.value = "";
  textContentInput.value = "";

  if (vcardFirstNameInput) vcardFirstNameInput.value = "";
  if (vcardLastNameInput) vcardLastNameInput.value = "";
  if (vcardPhoneInput) vcardPhoneInput.value = "";
  if (vcardEmailInput) vcardEmailInput.value = "";
  if (vcardCompanyInput) vcardCompanyInput.value = "";
  if (vcardWebsiteInput) vcardWebsiteInput.value = "";
  if (vcardJobTitleInput) vcardJobTitleInput.value = "";

  if (smsPhoneInput) smsPhoneInput.value = "";
  if (smsMessageInput) smsMessageInput.value = "";

  if (geoLatInput) geoLatInput.value = "";
  if (geoLngInput) geoLngInput.value = "";
  if (geoLabelInput) geoLabelInput.value = "";

  if (eventNameInput) eventNameInput.value = "";
  if (eventLocationInput) eventLocationInput.value = "";
  if (eventDescInput) eventDescInput.value = "";
  if (eventStartInput) eventStartInput.value = "";
  if (eventEndInput) eventEndInput.value = "";

  if (socialUsernameInput) socialUsernameInput.value = "";
  if (socialNetworkSelect) socialNetworkSelect.value = "telegram";
  if (socialPreviewLink) {
    socialPreviewLink.textContent = "—";
    socialPreviewLink.href = "#";
  }
}

function resetEditorStyles() {
  darkColorInput.value = "#000000";
  lightColorInput.value = "#ffffff";
  qrSizeInput.value = "260";
  qrMarginInput.value = "2";
  logoInput.value = "";
  currentLogoDataUrl = null;
  updateRangeLabels();
}

async function renderQr(config) {
  await qrRenderer.render(config);
  qrWrapper.classList.remove("hidden");
  lastGeneratedConfig = { ...config };
}

async function updatePreview() {
  const qrType = qrTypeSelect.value;
  const strategy = QrStrategyFactory.getStrategy(qrType);
  const formData = collectFormData();
  const validationError = strategy.validate(formData);
  const config = getQrConfig();

  updateRangeLabels();
  clearError();

  if (validationError) {
    clearQr();
    showError(validationError);
    return;
  }

  if (config.logoDataUrl && config.requestedMargin > 1) {
    showError("При логотипі відступ автоматично обмежено до 1, щоб QR краще сканувався.");
  }

  try {
    await renderQr(config);
  } catch (error) {
    showError(error.message);
    clearQr();
  }
}

function schedulePreviewUpdate() {
  clearTimeout(previewDebounce);
  previewDebounce = setTimeout(() => {
    updatePreview();
  }, 120);
}

async function saveQr(config) {
  const response = await fetch("/api/qr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      url: config.url,
      title: config.title,
      qrType: config.qrType,
      displayValue: config.displayValue,
      darkColor: config.darkColor,
      lightColor: config.lightColor,
      size: config.size,
      margin: config.margin,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Не вдалося зберегти QR.");
  }

  return data;
}

async function deleteQr(id) {
  const response = await fetch(`/api/qr/${id}`, { method: "DELETE" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Не вдалося видалити QR.");
  }

  return data;
}

async function clearHistory() {
  const response = await fetch("/api/qr", {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Не вдалося очистити історію.");
  }

  return data;
}

function renderHistory(items) {
  if (!items.length) {
    historyList.innerHTML = `<p class="muted">Історія порожня.</p>`;
    return;
  }

  historyList.innerHTML = items
    .map((item) => {
      const qrType = item.qr_type || "url";
      const strategy = QrStrategyFactory.getStrategy(qrType);
      const safeTitle = item.title ? escapeHtml(item.title) : "";
      const safeDisplayValue = escapeHtml(item.display_value || item.url || "");
      const openLink = strategy.getOpenLink(item.url || "");

      const encodedPayload = encodeURIComponent(
        JSON.stringify({
          url: item.url,
          title: item.title || "",
          qrType,
          displayValue: item.display_value || "",
          darkColor: item.dark_color || "#000000",
          lightColor: item.light_color || "#ffffff",
          size: Number(item.size) || 260,
          margin: Number(item.margin) || 2,
        })
      );

      return `
        <div class="history-item">
          <div class="qr-type-badge">${escapeHtml(strategy.getLabel())}</div>
          ${safeTitle ? `<div class="history-title">${safeTitle}</div>` : ""}
          <div class="history-display">${safeDisplayValue}</div>
          <div class="history-style">
            <span>QR: ${escapeHtml(item.dark_color || "#000000")}</span>
            <span>Фон: ${escapeHtml(item.light_color || "#ffffff")}</span>
            <span>Розмір: ${Number(item.size) || 260}px</span>
            <span>Відступ: ${Number(item.margin) || 2}</span>
          </div>
          <div class="history-meta">Створено: ${formatDate(item.created_at)}</div>
          <div class="history-actions">
            <button type="button" onclick="useHistoryQr('${encodedPayload}')">Відкрити QR</button>
            ${
              openLink
                ? `<a href="${escapeHtml(openLink)}" target="_blank" rel="noopener noreferrer">Відкрити</a>`
                : ""
            }
            <button type="button" class="danger-btn" onclick="removeQr(${item.id})">Видалити</button>
          </div>
        </div>
      `;
    })
    .join("");
}

window.useHistoryQr = async function (encodedPayload) {
  try {
    const payload = JSON.parse(decodeURIComponent(encodedPayload));

    qrTypeSelect.value = payload.qrType || "url";
    setActiveTypePanel(qrTypeSelect.value);

    clearTypeFields();
    const strategy = QrStrategyFactory.getStrategy(qrTypeSelect.value);
    const fields = strategy.parsePayload(payload.url || "");
    applyFormData(fields);
    updateSocialPreview();

    qrTitleInput.value = payload.title || "";
    darkColorInput.value = payload.darkColor || "#000000";
    lightColorInput.value = payload.lightColor || "#ffffff";
    qrSizeInput.value = String(payload.size || 260);
    qrMarginInput.value = String(payload.margin || 2);

    logoInput.value = "";
    currentLogoDataUrl = null;

    updateRangeLabels();
    await updatePreview();
  } catch {
    showError("Не вдалося відкрити QR з історії.");
  }
};

window.removeQr = async function (id) {
  const confirmed = window.confirm("Видалити цей QR з історії?");
  if (!confirmed) return;

  try {
    await deleteQr(id);
    await loadHistory();
  } catch (error) {
    showError(error.message);
  }
};

async function handleSaveClick() {
  const qrType = qrTypeSelect.value;
  const strategy = QrStrategyFactory.getStrategy(qrType);
  const formData = collectFormData();
  const validationError = strategy.validate(formData);
  const config = getQrConfig();

  clearError();

  if (!currentUser) {
    showError("Спочатку увійди в акаунт, щоб зберегти QR.");
    return;
  }

  if (validationError) {
    showError(validationError);
    return;
  }

  try {
    await renderQr(config);
    await saveQr(config);
    await loadHistory();
  } catch (error) {
    showError(error.message);
  }
}

function handleClearClick() {
  qrTitleInput.value = "";
  clearTypeFields();
  logoInput.value = "";
  currentLogoDataUrl = null;
  clearError();
  clearQr();
}

function handleDownloadClick() {
  if (!lastGeneratedConfig || !qrRenderer.canvas.width) {
    showError("Спочатку створи QR-код.");
    return;
  }

  const title = qrTitleInput.value.trim();
  const fileName = title
    ? `${title.replace(/[^\wа-яіїєґ-]+/gi, "_")}.png`
    : "qr-code.png";

  const link = document.createElement("a");
  link.href = qrRenderer.canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

async function handleResetStyleClick() {
  resetEditorStyles();
  await updatePreview();
}

async function handleClearHistory() {
  if (!currentUser) return;

  const confirmed = window.confirm("Точно очистити всю історію?");
  if (!confirmed) return;

  try {
    await clearHistory();
    await loadHistory();
    clearQr();
    clearError();
  } catch (error) {
    showError(error.message);
  }
}

async function handleLogout() {
  try {
    await fetch("/api/logout", { method: "POST", credentials: "include" });

    currentUser = null;
    updateAuthUi();
    clearQr();
    qrTitleInput.value = "";
    clearTypeFields();
    logoInput.value = "";
    currentLogoDataUrl = null;
    historyList.innerHTML = `<p class="muted">Увійди в акаунт, щоб бачити свої збережені QR-коди.</p>`;
  } catch {
    showError("Не вдалося вийти з акаунта.");
  }
}

async function loadHistory() {
  if (!currentUser) {
    historyList.innerHTML = `<p class="muted">Увійди в акаунт, щоб бачити свої збережені QR-коди.</p>`;
    return;
  }

  try {
    const response = await fetch("/api/qr");
    const data = await response.json();

    if (!response.ok) {
      historyList.innerHTML = `<p class="muted">Не вдалося завантажити історію.</p>`;
      return;
    }

    renderHistory(data);
  } catch {
    historyList.innerHTML = `<p class="muted">Помилка завантаження історії.</p>`;
  }
}

function updateAuthUi() {
  if (currentUser) {
    userInfo.textContent = `Ти увійшов як: ${currentUser.login}`;
    authWarning.classList.add("hidden");
    loginLink.classList.add("hidden");
    registerLink.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    clearHistoryBtn.classList.remove("hidden");
    saveBtn.classList.remove("hidden");
  } else {
    userInfo.textContent = "";
    authWarning.classList.remove("hidden");
    loginLink.classList.remove("hidden");
    registerLink.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    clearHistoryBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
  }
}

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/me", { credentials: "include" });
    const data = await response.json();
    currentUser = data.user;
    updateAuthUi();
    await loadHistory();
  } catch {
    currentUser = null;
    updateAuthUi();
    await loadHistory();
  }
}

logoInput.addEventListener("change", function (event) {
  const file = event.target.files && event.target.files[0];

  if (!file) {
    currentLogoDataUrl = null;
    schedulePreviewUpdate();
    return;
  }

  if (!file.type.startsWith("image/")) {
    showError("Можна завантажити тільки зображення.");
    logoInput.value = "";
    currentLogoDataUrl = null;
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    currentLogoDataUrl = reader.result;
    schedulePreviewUpdate();
  };

  reader.onerror = function () {
    showError("Не вдалося прочитати зображення.");
    logoInput.value = "";
    currentLogoDataUrl = null;
  };

  reader.readAsDataURL(file);
});

qrTypeSelect.addEventListener("change", function () {
  setActiveTypePanel(qrTypeSelect.value);
  clearError();
  schedulePreviewUpdate();
});

saveBtn.addEventListener("click", handleSaveClick);
clearBtn.addEventListener("click", handleClearClick);
downloadBtn.addEventListener("click", handleDownloadClick);
resetStyleBtn.addEventListener("click", handleResetStyleClick);
clearHistoryBtn.addEventListener("click", handleClearHistory);
logoutBtn.addEventListener("click", handleLogout);

[
  qrInput,
  qrTitleInput,
  wifiSsidInput,
  wifiPasswordInput,
  wifiSecurityInput,
  wifiHiddenInput,
  emailAddressInput,
  emailSubjectInput,
  emailBodyInput,
  emailCcInput,
  phoneNumberInput,
  textContentInput,
  darkColorInput,
  lightColorInput,
  qrSizeInput,
  qrMarginInput,
  vcardFirstNameInput,
  vcardLastNameInput,
  vcardPhoneInput,
  vcardEmailInput,
  vcardCompanyInput,
  vcardWebsiteInput,
  vcardJobTitleInput,
  smsPhoneInput,
  smsMessageInput,
  geoLatInput,
  geoLngInput,
  geoLabelInput,
  eventNameInput,
  eventLocationInput,
  eventDescInput,
  eventStartInput,
  eventEndInput,
].forEach((element) => {
  if (!element) return;
  const eventName = element.type === "checkbox" ? "change" : "input";
  element.addEventListener(eventName, schedulePreviewUpdate);
});

qrInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    schedulePreviewUpdate();
  }
});

phoneNumberInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    schedulePreviewUpdate();
  }
});

updateRangeLabels();
setActiveTypePanel(qrTypeSelect.value);
loadCurrentUser();
