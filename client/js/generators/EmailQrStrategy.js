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
    const { email, cc, subject, body } = formData;

    const emailError = this.validateRequired(formData, 'email', "Введи email адресу.");
    if (emailError) return emailError;

    if (subject && subject.length > 200) return "Тема занадто довга.";
    if (body && body.length > 2000) return "Текст листа занадто довгий.";

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
