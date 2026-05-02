import db from "../db/db.js";

export function createQr(userId, data) {
  return new Promise((resolve, reject) => {
    const {
      url,
      title,
      qrType,
      displayValue,
      darkColor,
      lightColor,
      size,
      margin
    } = data;

    db.run(
      `INSERT INTO qr_codes 
      (user_id, url, title, qr_type, display_value, dark_color, light_color, size, margin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, url, title, qrType, displayValue, darkColor, lightColor, size, margin],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

export function getUserQrs(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM qr_codes WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

export function deleteQr(userId, id) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM qr_codes WHERE id = ? AND user_id = ?`,
      [id, userId],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export function clearUserQrs(userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM qr_codes WHERE user_id = ?`,
      [userId],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}