const sellerRepository = require("../models/seller");
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

async function createSeller(payload) {
  const eventId = toOptionalTrimmedString(payload.event_id);
  const userId = toOptionalTrimmedString(payload.user_id);
  const price = Number(payload.price);
  const quantity = Number(payload.quantity);

  // 1. Validação de campos obrigatórios
  if (!eventId || !userId || payload.price === undefined || payload.quantity === undefined) {
    throw buildHttpError(400, "Campos obrigatórios: event_id, price, quantity.");
  }

  // 2. Validações numéricas (conforme o checklist)
  if (isNaN(price) || price < 0) {
    throw buildHttpError(400, "O preço (price) deve ser um número maior ou igual a 0.");
  }

  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    throw buildHttpError(400, "A quantidade (quantity) deve ser um número inteiro maior que 0.");
  }

  // 3. Validar se o evento existe (Retornar 404 se não existir)
  const eventExists = await sellerRepository.findEventById(eventId);
  if (!eventExists) {
    throw buildHttpError(404, "Evento não encontrado.");
  }

  // 4. Validar se o usuário existe
  const userExists = await userRepository.findById(userId);
  if (!userExists) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  // 5. Validar se o usuário já possui anúncio ativo para o evento (Retornar 409)
  const hasActiveSeller = await sellerRepository.findActiveSellerByUserAndEvent(userId, eventId);
  if (hasActiveSeller) {
    throw buildHttpError(409, "Usuário já possui um anúncio ativo para este evento.");
  }

  // 6. Persistência no banco
  try {
    return await sellerRepository.create({
      userId,
      eventId,
      price,
      quantity,
    });
  } catch (error) {
    console.error("Erro ao inserir vendedor no banco:", error);
    throw buildHttpError(500, "Erro ao registrar vendedor no banco de dados.");
  }
}

module.exports = {
  createSeller,
};