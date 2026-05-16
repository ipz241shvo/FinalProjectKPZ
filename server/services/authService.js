import bcrypt from "bcryptjs";
import { findUserByLogin, createUser } from "../models/userModel.js";

const SALT_ROUNDS = 10;

export const login = async (login, password) => {
  const user = await findUserByLogin(login);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Видаляємо пароль перед поверненням
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
  
};

export const register = async (login, password) => {
  const existingUser = await findUserByLogin(login);

  if (existingUser) {
    throw new Error("Користувач з таким логіном вже існує");
  }

  if (password.length < 6) {
    throw new Error("Пароль має бути не менше 6 символів");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return await createUser(login, hashedPassword);
};