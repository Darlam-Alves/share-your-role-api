const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../models/user");

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getSessionRole(user, loginEmail) {
  if (user.role === "admin") return "admin";

  const institutionalEmail = toOptionalTrimmedString(user.email_institutional)?.toLowerCase();

  if (user.role === "institutional" && loginEmail === institutionalEmail) {
    return "institutional";
  }

  return "public";
}

async function login(payload) {
  const email = toOptionalTrimmedString(payload.email)?.toLowerCase();
  const password = toOptionalTrimmedString(payload.password);

  if (!email || !password) {
    throw buildHttpError(400, "Campos obrigatórios: email, password.");
  }

  const user = await userRepository.findByEmail(email);

  const passwordMatch = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!user || !passwordMatch) {
    throw buildHttpError(401, "Email ou senha inválidos.");
  }

  const sessionRole = getSessionRole(user, email);

  const token = jwt.sign(
    {
      id: user.id,
      role: sessionRole,
      email_institutional_verified: user.email_institutional_verified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user: { id: user.id, name: user.name, role: sessionRole } };
}

module.exports = { login };
