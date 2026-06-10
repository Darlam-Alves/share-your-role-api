const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../models/user");

const SALT_ROUNDS = 10;

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getSessionRole(user, loginEmail) {
  if (user.role === "admin") return "admin";

  const institutionalEmail = toOptionalTrimmedString(user.email_institutional)?.toLowerCase();

  if (user.role === "institutional" && loginEmail === institutionalEmail) {
    return "institutional";
  }

  return "public";
}

async function createUser(payload) {
  const name = toOptionalTrimmedString(payload.name);
  const phone = toOptionalTrimmedString(payload.phone);
  const password = toOptionalTrimmedString(payload.password);
  const emailPersonal = toOptionalTrimmedString(payload.email_personal)?.toLowerCase();
  const emailInstitutional = toOptionalTrimmedString(payload.email_institutional)?.toLowerCase();

  if (!name || !phone || !password) {
    throw buildHttpError(400, "Campos obrigatorios: name, phone e password.");
  }

  if (!emailPersonal && !emailInstitutional) {
    throw buildHttpError(
      400,
      "Pelo menos um dos campos email_personal ou email_institutional deve ser enviado."
    );
  }

  const existingUser = await userRepository.findByEmails({
    emailPersonal,
    emailInstitutional,
  });

  if (existingUser) {
    throw buildHttpError(409, "Email ja cadastrado no sistema.");
  }

  const role = emailInstitutional ? "institutional" : "public";
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    return await userRepository.create({
      name,
      phone,
      emailPersonal,
      emailInstitutional,
      passwordHash,
      role,
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      throw buildHttpError(409, "Email ja cadastrado no sistema.");
    }

    throw error;
  }
}

async function login(payload) {
  const email = toOptionalTrimmedString(payload.email)?.toLowerCase();
  const password = toOptionalTrimmedString(payload.password);

  if (!email || !password) {
    throw buildHttpError(400, "Email e senha são obrigatórios.");
  }

  // 1. Busca o usuário (usando a lógica de OR que você já tem no model)
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw buildHttpError(401, "E-mail ou senha inválidos.");
  }

  // 2. Verifica a senha
  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw buildHttpError(401, "E-mail ou senha inválidos.");
  }

  const sessionRole = getSessionRole(user, email);

  // 3. Gera o Token JWT
  // Dica: use uma string segura no seu .env como JWT_SECRET
  const token = jwt.sign(
    { 
      id: user.id, 
      role: sessionRole,
      name: user.name 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: sessionRole,
      email_institutional_verified: user.email_institutional_verified
    }
  };
}

module.exports = {
  createUser,
  login
};
