import sqlite3 from "sqlite3";

class Database {
  constructor() {
    if (!Database.instance) {
      this.db = new sqlite3.Database("database.db", (err) => {
        if (err) {
          console.error("❌ Помилка підключення до БД:", err.message);
        } else {
          console.log("✅ Підключено до SQLite");
        }
      });

      this.init();

      Database.instance = this;
    }
    return Database.instance;
  }

  init() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          login TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error("❌ Помилка створення таблиці users:", err.message);
        } else {
          console.log("✅ Таблиця users готова");
        }
      });

      this.db.run(`
        CREATE TABLE IF NOT EXISTS qr_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            url TEXT,
            title TEXT,
            qr_type TEXT,
            display_value TEXT,
            dark_color TEXT,
            light_color TEXT,
            size INTEGER,
            margin INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error("❌ Помилка створення таблиці qrcodes:", err.message);
        } else {
          console.log("✅ Таблиця qrcodes готова");
        }
      });
    });
  }

  getDB() {
    return this.db;
  }
}

export default new Database().getDB();