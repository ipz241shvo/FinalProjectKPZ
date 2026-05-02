import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { isValidEmail } from "../validators/validators.js";

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 2000;

export class EmailQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const email = formData.email;
    const cc = formData.emailCc;
    const subject = formData.emailSubject;
    const body = formData.emailBody;

    const params = new URLSearchParams();
    if (cc) params.set("cc", cc);
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);

    const queryString = params.toString();
    const payload = `mailto:${email}${queryString ? `?${queryString}` : ""}`;
    return { payload, displayValue: email };
  }

  validate(formData) {
    const email = formData.email;
    const cc = formData.emailCc;
    const subject = formData.emailSubject;
    const body = formData.emailBody;

    if (!email) return "Введи email адресу.";
    if (!isValidEmail(email)) return "Введи коректний email, наприклад: user@example.com";
    if (cc && !isValidEmail(cc)) return "Введи коректний email для копії (CC).";
    if (subject && subject.length > MAX_SUBJECT_LENGTH) {
      return `Тема листа не може перевищувати ${MAX_SUBJECT_LENGTH} символів.`;
    }
    if (body && body.length > MAX_BODY_LENGTH) {
      return `Текст листа не може перевищувати ${MAX_BODY_LENGTH} символів.`;
    }

    return null;
  }

  sanitize(formData) {
    const email = formData.email;
    if (!email) return formData;
    return { ...formData, email: email.toLowerCase().trim() };
  }

  parsePayload(rawPayload) {
    const raw = String(rawPayload || "");
    if (!raw.startsWith("mailto:")) {
      return { email: raw, emailCc: "", emailSubject: "", emailBody: "" };
    }
    const withoutScheme = raw.slice(7);
    const [emailPart, queryPart = ""] = withoutScheme.split("?");
    const params = new URLSearchParams(queryPart);
    return {
      email: decodeURIComponent(emailPart || ""),
      emailCc: params.get("cc") || "",
      emailSubject: params.get("subject") || "",
      emailBody: params.get("body") || "",
    };
  }

  getLabel() {
    return "Email";
  }

  getOpenLink(payload) {
    if (String(payload || "").startsWith("mailto:")) return payload;
    return null;
  }
}
