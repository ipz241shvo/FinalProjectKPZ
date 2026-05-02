import * as authService from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await authService.login(login, password);

    req.session.user = user;

    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

export const register = async (req, res) => {
  try {
    const { login, password } = req.body;

    await authService.register(login, password);

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};