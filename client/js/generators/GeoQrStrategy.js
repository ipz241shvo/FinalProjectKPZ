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
    const lat = formData.geoLat;
    const lng = formData.geoLng;

    if (!lat && !lng) return "Введіть координати місця.";
    if (!lat) return "Введіть широту.";
    if (!lng) return "Введіть довготу.";

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum)) return "Широта має бути числом.";
    if (isNaN(lngNum)) return "Довгота має бути числом.";
    if (!isValidLatitude(lat)) return "Широта має бути від -90 до 90.";
    if (!isValidLongitude(lng)) return "Довгота має бути від -180 до 180.";

    return null;
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
