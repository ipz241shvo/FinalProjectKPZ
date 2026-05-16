import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import * as authController from "./controllers/authController.js";
import * as qrModel from "./models/qrModel.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/index.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/html/register.html"));
});

app.post("/api/login", authController.login);
app.post("/api/register", authController.register);

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Не авторизовано" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); 
    res.json({ success: true });
  });
});

app.post("/api/qr", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  const { url, qrType } = req.body;
  if (!url || !qrType) {
    return res.status(400).json({ message: "Відсутні обов'язкові поля" });
  }

  try {
    const result = await qrModel.createQr(req.session.user.id, req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Помилка збереження" });
  }
});

app.get("/api/qr", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  try {
    const qrs = await qrModel.getUserQrs(req.session.user.id);
    res.json(qrs);
  } catch {
    res.status(500).json({ message: "Помилка завантаження" });
  }
});

app.delete("/api/qr/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  try {
    await qrModel.deleteQr(req.session.user.id, req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Помилка видалення" });
  }
});

app.delete("/api/qr", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Не авторизований" });
  }

  try {
    await qrModel.clearUserQrs(req.session.user.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Помилка очищення" });
  }
});

app.listen(3000, () => {
  console.log("Сервер: http://localhost:3000");
});