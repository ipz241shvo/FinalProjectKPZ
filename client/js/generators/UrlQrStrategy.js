import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { isValidUrl } from "../validators/validators.js";

const ALLOWED_PROTOCOLS = ["http:", "https:", "ftp:", "ftps:", "mailto:", "tel:"];

export class UrlQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const url = formData.url;
    return { payload: url, displayValue: url };
  }

  validate(formData) {
    const value = formData.url;
    if (!value) return "Введи посилання.";
    if (!isValidUrl(value)) return "Введи коректне посилання, наприклад: https://example.com";

    try {
      const parsed = new URL(value);
      if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        return `Протокол «${parsed.protocol}» не підтримується. Використовуй http:// або https://.`;
      }
    } catch {
      return "Введи коректне посилання, наприклад: https://example.com";
    }

    return null;
  }

  sanitize(formData) {
    const url = formData.url;
    if (!url) return formData;
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url);
    if (!hasProtocol) {
      return { ...formData, url: `https://${url}` };
    }
    return formData;
  }

  parsePayload(rawPayload) {
    return { url: rawPayload || "" };
  }

  getLabel() {
    return "Посилання";
  }

  getOpenLink(payload) {
    if (isValidUrl(payload)) return payload;
    return null;
  }
}
