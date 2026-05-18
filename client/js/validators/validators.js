export function isValidUrl(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export function isValidEmail(value) {
    const email = String(value || "").trim();

    return email.includes("@");
}

export function isValidPhone(value) {
    const phone = String(value || "").trim();

    return phone.length > 0;
}

export function isValidLatitude(value) {
    const latitude = parseFloat(value);

    return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(value) {
    const longitude = parseFloat(value);

    return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
}