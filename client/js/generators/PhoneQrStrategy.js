import { BaseQrStrategy } from "./BaseQrStrategy.js";

const PHONE_DIGITS_REGEX = /\d/;
const PHONE_VALID_CHARS_REGEX = /^[+\d\s\-().]+$/;

export class PhoneQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const phone = formData.phone;
    return { payload: `tel:${phone}`, displayValue: phone };
  }

  validate(formData) {
    const phone = formData.phone;
    if (!phone) return "Введи номер телефону.";
    if (!PHONE_DIGITS_REGEX.test(phone)) return "Номер телефону має містити хоча б одну цифру.";
    if (!PHONE_VALID_CHARS_REGEX.test(phone)) {
      return "Номер телефону може містити лише цифри, +, пробіли, дефіси та дужки.";
    }
    return null;
  }

  sanitize(formData) {
    const phone = formData.phone;
    if (!phone) return formData;
    return { ...formData, phone: phone.replace(/\s+/g, " ").trim() };
  }

  parsePayload(rawPayload) {
    const phone = String(rawPayload || "").replace(/^tel:/, "");
    return { phone };
  }

  getLabel() {
    return "Телефон";
  }

  getOpenLink(payload) {
    if (String(payload || "").startsWith("tel:")) return payload;
    return null;
  }
}
