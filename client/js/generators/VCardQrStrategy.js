import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { isValidEmail, isValidUrl } from "../validators/validators.js";

export class VCardQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const firstName = formData.vcardFirstName;
    const lastName = formData.vcardLastName;
    const phone = formData.vcardPhone;
    const email = formData.vcardEmail;
    const company = formData.vcardCompany;
    const website = formData.vcardWebsite;
    const jobTitle = formData.vcardJobTitle;
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Контакт";

    let vcard = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
    vcard += `N:${lastName};${firstName}\r\n`;
    vcard += `FN:${displayName}\r\n`;
    if (phone) vcard += `TEL;TYPE=CELL:${phone}\r\n`;
    if (email) vcard += `EMAIL:${email}\r\n`;
    if (company) vcard += `ORG:${company}\r\n`;
    if (jobTitle) vcard += `TITLE:${jobTitle}\r\n`;
    if (website) vcard += `URL:${website}\r\n`;
    vcard += "END:VCARD";

    return { payload: vcard, displayValue: displayName };
  }

  validate(formData) {
    const { vcardFirstName, vcardLastName, vcardEmail, vcardWebsite } = formData;

    if (!vcardFirstName && !vcardLastName) return "Введіть хоча б ім'я або прізвище.";
    
    if (vcardEmail && !isValidEmail(vcardEmail)) return "Введіть коректний email контакту.";
    if (vcardWebsite && !isValidUrl(vcardWebsite)) return "Введіть коректне посилання на сайт контакту.";

    return null;
  }

  parsePayload(rawPayload) {
    const lines = String(rawPayload || "").split(/\r?\n/);

    const get = (prefix) => {
      const line = lines.find((l) => l.startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : "";
    };

    const nParts = get("N:").split(";");
    return {
      vcardLastName: nParts[0] || "",
      vcardFirstName: nParts[1] || "",
      vcardPhone: get("TEL;TYPE=CELL:"),
      vcardEmail: get("EMAIL:"),
      vcardCompany: get("ORG:"),
      vcardJobTitle: get("TITLE:"),
      vcardWebsite: get("URL:"),
    };
  }

  getLabel() {
    return "Контакт";
  }

  getOpenLink(payload) {
    return null;
  }
}
