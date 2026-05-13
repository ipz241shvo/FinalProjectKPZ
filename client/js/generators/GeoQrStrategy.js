import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { isValidLatitude, isValidLongitude } from "../validators/validators.js";

const GEO_COORDINATE_PRECISION = 6;

export class GeoQrStrategy extends BaseQrStrategy {
  buildPayload(formData) {
    const lat = formData.geoLat;
    const lng = formData.geoLng;
    const label = formData.geoLabel;

    const latRounded = parseFloat(lat).toFixed(GEO_COORDINATE_PRECISION);
    const lngRounded = parseFloat(lng).toFixed(GEO_COORDINATE_PRECISION);

    const payload = label
      ? `geo:${latRounded},${lngRounded}?q=${latRounded},${lngRounded}(${encodeURIComponent(label)})`
      : `geo:${latRounded},${lngRounded}`;

    return { payload, displayValue: label || `${latRounded}, ${lngRounded}` };
  }

  validate(formData) {
    const { geoLat, geoLng } = formData;

    if (!geoLat && !geoLng) return "Введіть координати місця.";

    return this.require(formData, 'geoLat', "Введіть широту.") ||
        this.require(formData, 'geoLng', "Введіть довготу.");

  }

  parsePayload(rawPayload) {
    const raw = String(rawPayload || "");
    const coordMatch = raw.match(/^geo:([-\d.]+),([-\d.]+)/);
    const labelMatch = raw.match(/\(([^)]+)\)/);
    return {
      geoLat: coordMatch ? coordMatch[1] : "",
      geoLng: coordMatch ? coordMatch[2] : "",
      geoLabel: labelMatch ? decodeURIComponent(labelMatch[1]) : "",
    };
  }

  getLabel() {
    return "Геолокація";
  }

  getOpenLink(payload) {
    return null;
  }
}
