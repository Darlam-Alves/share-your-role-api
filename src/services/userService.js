const bcrypt = require("bcrypt");
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

module.exports = {
  createUser,
};
