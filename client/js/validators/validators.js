export function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(value) {
  return String(value || "").includes("@");
}

export function isValidPhone(value) {
  return String(value || "").trim().length > 0;
}

export function isValidLatitude(value) {
  const n = parseFloat(value);
  return !isNaN(n) && n >= -90 && n <= 90;
}

export function isValidLongitude(value) {
  const n = parseFloat(value);
  return !isNaN(n) && n >= -180 && n <= 180;
}
