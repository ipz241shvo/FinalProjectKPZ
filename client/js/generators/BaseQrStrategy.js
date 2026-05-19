export class BaseQrStrategy {
  buildPayload(formData) {
    throw new Error(
      `${this.constructor.name} must implement buildPayload(formData)`
    );
  }

  validate(formData) {
    throw new Error(
      `${this.constructor.name} must implement validate(formData)`
    );
  }

  parsePayload(rawPayload) {
    throw new Error(
      `${this.constructor.name} must implement parsePayload(rawPayload)`
    );
  }

  getLabel() {
    throw new Error(
      `${this.constructor.name} must implement getLabel()`
    );
  }

  sanitize(formData) {
    return formData;
  }

  getOpenLink(payload) {
    return null;
  }

  normalizeString(value) {
    return String(value || "").trim();
  }

  isEmpty(value) {
    return !this.normalizeString(value);
  }

  safePayload(value) {
    return String(value || "");
  }

  validateRequired(value, message) {
    if (this.isEmpty(value)) {
      return message;
    }

    return null;
  }
}
