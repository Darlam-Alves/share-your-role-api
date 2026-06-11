const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../models/user");

const SALT_ROUNDS = 10;
const WHATSAPP_DIGITS_REGEX = /^\d{10,13}$/;
const INSTAGRAM_HANDLE_REGEX = /^@[a-zA-Z0-9_.]{1,30}$/;
const TELEGRAM_HANDLE_REGEX = /^@[a-zA-Z0-9_]{5,32}$/;
const PROFILE_IMAGE_DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
const MAX_PROFILE_IMAGE_URL_LENGTH = 1_000_000;

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

function normalizeName(value) {
  const name = toOptionalTrimmedString(value);
  if (!name) {
    throw buildHttpError(400, "Nome completo é obrigatório.");
  }

  if (name.length < 3) {
    throw buildHttpError(400, "Nome completo deve ter pelo menos 3 caracteres.");
  }

  return name;
}

function normalizeBio(value) {
  const bio = toOptionalTrimmedString(value);
  if (!bio) return null;

  if (bio.length > 280) {
    throw buildHttpError(400, "Bio deve ter no máximo 280 caracteres.");
  }

  return bio;
}

function normalizePhone(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) {
    throw buildHttpError(400, "Telefone é obrigatório.");
  }

  const digits = raw.replace(/\D/g, "");
  if (!WHATSAPP_DIGITS_REGEX.test(digits)) {
    throw buildHttpError(400, "Telefone inválido. Use DDD + número, com 10 a 13 dígitos.");
  }

  return digits;
}

function normalizeWhatsapp(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!WHATSAPP_DIGITS_REGEX.test(digits)) {
    throw buildHttpError(400, "WhatsApp inválido. Use DDD + número, com 10 a 13 dígitos.");
  }

  return digits;
}

function normalizeInstagram(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;

  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (!INSTAGRAM_HANDLE_REGEX.test(handle)) {
    throw buildHttpError(400, "Instagram inválido. Use @usuario com até 30 caracteres.");
  }

  return handle.toLowerCase();
}

function normalizeTelegram(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;

  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (!TELEGRAM_HANDLE_REGEX.test(handle)) {
    throw buildHttpError(400, "Telegram inválido. Use @usuario com 5 a 32 caracteres.");
  }

  return handle.toLowerCase();
}

function normalizeProfileImageUrl(value) {
  const imageUrl = toOptionalTrimmedString(value);
  if (!imageUrl) return null;

  if (imageUrl.length > MAX_PROFILE_IMAGE_URL_LENGTH) {
    throw buildHttpError(400, "A foto de perfil deve ter no máximo 1 MB.");
  }

  const isDataUrl = PROFILE_IMAGE_DATA_URL_REGEX.test(imageUrl);
  const isRemoteUrl = /^https?:\/\/.+/i.test(imageUrl);

  if (!isDataUrl && !isRemoteUrl) {
    throw buildHttpError(400, "Foto de perfil inválida. Use PNG, JPG ou WEBP.");
  }

  return imageUrl;
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

async function getMyProfile(userId) {
  const user = await userRepository.findProfileById(userId);
  if (!user) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  return user;
}

async function getPublicProfile(userId) {
  const user = await userRepository.findPublicProfileById(userId);
  if (!user) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  return user;
}

async function updateMyProfile(userId, payload) {
  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  return userRepository.updateProfile(userId, {
    name: normalizeName(payload.name),
    bio: normalizeBio(payload.bio),
    phone: normalizePhone(payload.phone),
    profileImageUrl: normalizeProfileImageUrl(payload.profile_image_url),
    resaleWhatsapp: normalizeWhatsapp(payload.resale_whatsapp),
    resaleInstagram: normalizeInstagram(payload.resale_instagram),
    resaleTelegram: normalizeTelegram(payload.resale_telegram),
  });
}

function serializeMyEvent(event) {
  return {
    id: event.id,
    name: event.name,
    image_url: event.image_url,
    date: event.date,
    ended_at: event.ended_at,
    visibility_type: event.visibility_type,
    ticket_platform: event.ticket_platform,
    ticket_url: event.ticket_url,
    created_at: event.created_at,
    resales_count: event._count?.sellers ?? 0,
  };
}

function serializeMyResale(resale) {
  return {
    id: resale.id,
    price: Number(resale.price),
    quantity: resale.quantity,
    status: resale.status,
    created_at: resale.created_at,
    event: resale.event,
  };
}

async function getMyEvents(userId) {
  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  const events = await userRepository.listEventsByUserId(userId);
  return events.map(serializeMyEvent);
}

async function getMyResales(userId) {
  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  const resales = await userRepository.listResalesByUserId(userId);
  return resales.map(serializeMyResale);
}

module.exports = {
  createUser,
  login,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  getMyEvents,
  getMyResales,
};
