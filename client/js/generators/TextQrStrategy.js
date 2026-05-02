import { BaseQrStrategy } from "./BaseQrStrategy.js";

const TEXT_DISPLAY_PREVIEW_LENGTH = 120;
const TEXT_MAX_RECOMMENDED_LENGTH = 900;
const TEXT_ABSOLUTE_MAX_LENGTH = 2953;

export class TextQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const text = formData.text;
    return { payload: text, displayValue: text.slice(0, TEXT_DISPLAY_PREVIEW_LENGTH) };
  }

  validate(formData) {
    const text = formData.text;
    if (!text) return "Введи текст.";
    if (text.length > TEXT_ABSOLUTE_MAX_LENGTH) {
      return `Текст перевищує максимальну ємність QR-коду (${TEXT_ABSOLUTE_MAX_LENGTH} символів).`;
    }
    if (text.length > TEXT_MAX_RECOMMENDED_LENGTH) {
      return `Текст дуже довгий (${text.length} символів). Рекомендовано до ${TEXT_MAX_RECOMMENDED_LENGTH} для кращого сканування.`;
    }
    return null;
  }

  sanitize(formData) {
    const text = formData.text;
    if (!text) return formData;
    return { ...formData, text: text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") };
  }

  parsePayload(rawPayload) {
    return { text: rawPayload || "" };
  }

  getLabel() {
    return "Текст";
  }

  getOpenLink(payload) {
    return null;
  }
}
