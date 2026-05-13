import { BaseQrStrategy } from "./BaseQrStrategy.js";

const ICAL_DATE_REGEX = /^\d{8}T\d{6}Z?$/;

export class EventQrStrategy extends BaseQrStrategy {
  formatDt(dateTimeLocal) {
    if (!dateTimeLocal) return "";
    return dateTimeLocal.replace(/[-:T]/g, "").slice(0, 15) + "Z";
  }

  parseDt(dt) {
    if (!dt) return "";
    const s = String(dt).replace("Z", "");
    if (!ICAL_DATE_REGEX.test(dt) && s.length < 13) return "";
    const year = s.slice(0, 4);
    const month = s.slice(4, 6);
    const day = s.slice(6, 8);
    const hour = s.slice(9, 11);
    const minute = s.slice(11, 13);
    if (!year || !month || !day) return "";
    return `${year}-${month}-${day}T${hour || "00"}:${minute || "00"}`;
  }

  buildPayload(formData) {
    const name = formData.eventName;
    const location = formData.eventLocation;
    const description = formData.eventDesc;
    const start = formData.eventStart;
    const end = formData.eventEnd;
    const uid = `qr-${Date.now()}@qrstudio`;

    let vevent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n";
    vevent += `UID:${uid}\r\n`;
    vevent += `SUMMARY:${name}\r\n`;
    if (start) vevent += `DTSTART:${this.formatDt(start)}\r\n`;
    if (end) vevent += `DTEND:${this.formatDt(end)}\r\n`;
    if (location) vevent += `LOCATION:${location}\r\n`;
    if (description) vevent += `DESCRIPTION:${description}\r\n`;
    vevent += "END:VEVENT\r\nEND:VCALENDAR";

    return { payload: vevent, displayValue: name || "Подія" };
  }

  validate(formData) {
    const { eventName, eventStart, eventEnd } = formData;

    const nameError = this.require(formData, 'eventName', "Введіть назву події.") ||
        this.limit(eventName, 200, "Назва події");
    if (nameError) return nameError;

    if (eventStart && eventEnd) {
      const startDate = new Date(eventStart);
      const endDate = new Date(eventEnd);
      if (isNaN(startDate.getTime())) return "Дата початку невалідна.";
      if (isNaN(endDate.getTime())) return "Дата кінця невалідна.";
      if (startDate >= endDate) return "Дата початку має бути раніше дати кінця.";
    }

    return null;
  }

  parsePayload(rawPayload) {
    const lines = String(rawPayload || "").split(/\r?\n/);

    const get = (prefix) => {
      const line = lines.find((l) => l.startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : "";
    };

    return {
      eventName: get("SUMMARY:"),
      eventLocation: get("LOCATION:"),
      eventDesc: get("DESCRIPTION:"),
      eventStart: this.parseDt(get("DTSTART:")),
      eventEnd: this.parseDt(get("DTEND:")),
    };
  }

  getLabel() {
    return "Подія";
  }

  getOpenLink(payload) {
    return null;
  }
}
