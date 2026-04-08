const bcrypt = require("bcrypt");
// Atualizei o caminho para o nome novo do arquivo user.models. Estava tudo user.js
const userRepository = require("../models/user.models"); 

const SALT_ROUNDS = 10;

// Criando classes de erro para separar a regra de negócio do HTTP
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
}

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

async function createUser(payload) {
  const name = toOptionalTrimmedString(payload.name);
  const phone = toOptionalTrimmedString(payload.phone);
  const password = toOptionalTrimmedString(payload.password);
  const emailPersonal = toOptionalTrimmedString(payload.email_personal)?.toLowerCase();
  const emailInstitutional = toOptionalTrimmedString(payload.email_institutional)?.toLowerCase();

  // 1. Validação de dados de entrada
  if (!name || !phone || !password) {
    throw new ValidationError("Campos obrigatórios: name, phone e password.");
  }

  if (!emailPersonal && !emailInstitutional) {
    throw new ValidationError(
      "Pelo menos um dos campos email_personal ou email_institutional deve ser enviado."
    );
  }

  // 2. Verificação de regras de negócio (Conflitos)
  const existingUser = await userRepository.findByEmails({
    emailPersonal,
    emailInstitutional,
  });

  if (existingUser) {
    throw new ConflictError("Email já cadastrado no sistema.");
  }

  // 3. Preparação dos dados
  const role = emailInstitutional ? "institutional" : "public";
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Persistência
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
    // P2002 é o código de erro do Prisma para Unique Constraint Violation
    if (error && error.code === "P2002") {
      throw new ConflictError("Email já cadastrado no sistema.");
    }
    throw error;
  }
}

module.exports = {
  createUser,
  ValidationError,
  ConflictError
};
