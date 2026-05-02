import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { escapeWifiValue, parseWifiPayload } from "../utils/wifiUtils.js";

const VALID_SECURITY_TYPES = ["WPA", "WEP", "nopass"];
const MAX_SSID_LENGTH = 32;
const MAX_WIFI_PASSWORD_LENGTH = 63;

export class WifiQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const ssid = formData.ssid;
    const password = formData.password;
    const security = VALID_SECURITY_TYPES.includes(formData.security) ? formData.security : "WPA";
    const hidden = formData.hidden ? "true" : "false";
    const payload = `WIFI:T:${escapeWifiValue(security)};S:${escapeWifiValue(ssid)};P:${escapeWifiValue(password)};H:${hidden};;`;
    return { payload, displayValue: ssid };
  }

  validate(formData) {
    const ssid = formData.ssid;
    const password = formData.password;
    const security = formData.security;

    if (!ssid) return "Введи назву Wi-Fi мережі (SSID).";
    if (ssid.length > MAX_SSID_LENGTH) {
      return `Назва мережі не може перевищувати ${MAX_SSID_LENGTH} символів.`;
    }
    if (security !== "nopass" && !password) {
      return "Для захищеної Wi-Fi мережі введи пароль.";
    }
    if (password && password.length > MAX_WIFI_PASSWORD_LENGTH) {
      return `Пароль Wi-Fi не може перевищувати ${MAX_WIFI_PASSWORD_LENGTH} символів.`;
    }

    return null;
  }

  parsePayload(rawPayload) {
    const wifi = parseWifiPayload(rawPayload);
    return {
      ssid: wifi.ssid,
      password: wifi.password,
      security: wifi.security,
      hidden: wifi.hidden,
    };
  }

  getLabel() {
    return "Wi-Fi";
  }

  getOpenLink(payload) {
    return null;
  }
}
