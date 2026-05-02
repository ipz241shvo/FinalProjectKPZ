import db from "../db/db.js";

export const findUserByLogin = (login) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE login = ?",
      [login],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

export const createUser = (login, password) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (login, password) VALUES (?, ?)",
      [login, password],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};