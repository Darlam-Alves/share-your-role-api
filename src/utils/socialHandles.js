const SOCIAL_HANDLE_PATTERNS = {
  instagram: /^@[a-zA-Z0-9_.]{1,30}$/,
  telegram: /^@[a-zA-Z0-9_]{5,32}$/,
};

const DEFAULT_ERROR_MESSAGES = {
  instagram: "Instagram inválido.",
  telegram: "Telegram inválido.",
};

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function sanitizeSocialHandle(value, { platform, message } = {}) {
  const pattern = SOCIAL_HANDLE_PATTERNS[platform];
  if (!pattern) {
    throw new Error(`Plataforma de rede social não suportada: ${platform}`);
  }

  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;

  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (!pattern.test(handle)) {
    throw buildValidationError(message ?? DEFAULT_ERROR_MESSAGES[platform]);
  }

  return handle.toLowerCase();
}

module.exports = { sanitizeSocialHandle };
