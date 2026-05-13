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
    const { ssid, password, security } = formData;

    const ssidError = this.validateRequired(formData, 'ssid', "Введи назву Wi-Fi мережі (SSID).");
    if (ssidError) return ssidError;

    if (ssid.length > 32) return "Назва мережі занадто довга.";
    if (security !== "nopass" && !password) return "Для захищеної мережі введи пароль.";

    return this.validateMaxLength(password, 63, "Пароль Wi-Fi");
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
