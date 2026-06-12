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
// 6. Persistência no banco
try {
    const newSeller = await sellerRepository.create({
      userId,
      eventId,
      price,
      quantity,
    });

    // Formatando o retorno para o controller/front-end
    return {
      id: newSeller.id,
      event_id: newSeller.event_id,
      price: newSeller.price,
      quantity: newSeller.quantity,
      status: newSeller.status,
      created_at: newSeller.created_at,
      vendor: {
        id: newSeller.user.id,
        name: newSeller.user.name,
        phone: newSeller.user.phone // Disponível para o front criar o link de WhatsApp
      }
    };

  } catch (error) {
    console.error("Erro ao inserir vendedor no banco:", error);
    throw buildHttpError(500, "Erro ao registrar vendedor no banco de dados.");
  }
}

async function listSellersByEvent(eventId) {
    const normalizedEventId = toOptionalTrimmedString(eventId);
  
    if (!normalizedEventId) {
      throw buildHttpError(400, "O parâmetro id do evento é obrigatório.");
    }
  
    // Verificar se o evento existe antes de listar
    const eventExists = await sellerRepository.findEventById(normalizedEventId);
    if (!eventExists) {
      throw buildHttpError(404, "Evento não encontrado.");
    }
  
    const sellers = await sellerRepository.findManyByEventId(normalizedEventId);
  
    // Formata a lista para o padrão amigável do front-end
    return sellers.map((seller) => ({
      id: seller.id,
      event_id: seller.event_id,
      price: seller.price,
      quantity: seller.quantity,
      status: seller.status,
      created_at: seller.created_at,
      vendor: {
        id: seller.user.id,
        name: seller.user.name,
        phone: seller.user.phone,
      },
    }));
  }

module.exports = {
  createSeller,
  listSellersByEvent
};