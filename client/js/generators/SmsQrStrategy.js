import { BaseQrStrategy } from "./BaseQrStrategy.js";

const PHONE_DIGITS_REGEX = /\d/;
const MAX_SMS_MESSAGE_LENGTH = 160;

export class SmsQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const phone = formData.smsPhone;
    const message = formData.smsMessage;
    const payload = message ? `SMSTO:${phone}:${message}` : `SMSTO:${phone}:`;
    return { payload, displayValue: phone };
  }

  validate(formData) {
    return this.require(formData, 'smsPhone', "Введіть номер телефону.") ||
        this.matches(formData.smsPhone, PHONE_DIGITS_REGEX, "Номер має містити цифри.") ||
        this.limit(formData.smsMessage, 160, "Повідомлення");
  }

  parsePayload(rawPayload) {
    const withoutPrefix = String(rawPayload || "").replace(/^SMSTO:/, "");
    const colonIdx = withoutPrefix.indexOf(":");
    if (colonIdx === -1) {
      return { smsPhone: withoutPrefix, smsMessage: "" };
    }
    return {
      smsPhone: withoutPrefix.slice(0, colonIdx),
      smsMessage: withoutPrefix.slice(colonIdx + 1),
    };
  }

  getLabel() {
    return "SMS";
  }

  getOpenLink(payload) {
    return null;
  }
}
