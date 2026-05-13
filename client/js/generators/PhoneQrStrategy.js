import { BaseQrStrategy } from "./BaseQrStrategy.js";

const PHONE_DIGITS_REGEX = /\d/;
const PHONE_VALID_CHARS_REGEX = /^[+\d\s\-().]+$/;

export class PhoneQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const phone = formData.phone;
    return { payload: `tel:${phone}`, displayValue: phone };
  }

  validate(formData) {
    const { phone } = formData;

    return this.require(formData, 'phone', "Введи номер телефону.") ||
        this.matches(phone, /\d/, "Номер телефону має містити хоча б одну цифру.") ||
        this.matches(phone, /^[+\d\s\-().]+$/, "Номер телефону може містити лише цифри, +, пробіли, дефіси та дужки.");
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
