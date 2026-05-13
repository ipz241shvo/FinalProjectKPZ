export class BaseQrStrategy {
  validateRequired(formData, fieldName, errorMessage) {
    if (!formData[fieldName] || formData[fieldName].trim() === "") {
      return errorMessage || `Поле ${fieldName} обов'язкове.`;
    }
    return null;
  }

  validateMaxLength(value, maxLength, fieldName) {
    if (value && value.length > maxLength) {
      return `${fieldName} не може перевищувати ${maxLength} символів.`;
    }
    return null;
  }

  require(formData, field, message) {
    if (!formData[field] || formData[field].trim() === "") {
      return message || `Поле ${field} обов'язкове.`;
    }
    return null;
  }

  limit(value, max, fieldName) {
    if (value && value.length > max) {
      return `${fieldName} не може бути довшим за ${max} символів.`;
    }
    return null;
  }

  matches(value, regex, error) {
    if (value && !regex.test(value)) return error;
    return null;
  }

  buildPayload(formData) {
    throw new Error(`${this.constructor.name} must implement buildPayload(formData)`);
  }

  validate(formData) {
    throw new Error(`${this.constructor.name} must implement validate(formData)`);
  }

  parsePayload(rawPayload) {
    throw new Error(`${this.constructor.name} must implement parsePayload(rawPayload)`);
  }

  getLabel() {
    throw new Error(`${this.constructor.name} must implement getLabel()`);
  }

  sanitize(formData) {
    return formData;
  }

  getOpenLink(payload) {
    return null;
  }
}