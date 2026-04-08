const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../models/user.models");

// É fortemente recomendado colocar essa chave no arquivo .env
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura_de_desenvolvimento";

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function login({ email, password }) {
  // Regra: Status 400 - email ou password não enviados
  if (!email || !password) {
    throw new ValidationError("E-mail e senha são obrigatórios.");
  }

  // Busca o usuário. Suponho que tenha um método no userRepository 
  // que busque pelas duas colunas de e-mail usando o OR do Prisma.
  const user = await userRepository.findByEmail(email);

  // Regra: Se o e-mail não existir -> 401 genérico
  if (!user) {
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  // Regra: Compara a senha enviada com o hash do banco
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  // Regra: Se a senha estiver errada -> 401 genérico
  if (!isPasswordValid) {
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  // Sucesso! Gera o token JWT com 7 dias de validade
  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role 
    }, 
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token };
}

module.exports = {
  login,
  ValidationError,
  UnauthorizedError
};
