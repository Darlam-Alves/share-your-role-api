const sellerRepository = require("../models/seller");
const eventRepository = require("../models/event");
// TODO: implementar teto de preço via reference_price no evento (decisão pendente: obrigatório ou opcional)

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createSeller({ eventId, userId, price, quantity }) {
  if (!eventId) {
    throw buildHttpError(400, "Parâmetro event_id é obrigatório.");
  }

  const event = await eventRepository.findById(eventId);
  if (!event) {
    throw buildHttpError(404, "Evento não encontrado.");
  }

  if (price === undefined || price === null || price === "") {
    throw buildHttpError(400, "Campo price é obrigatório.");
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice)) {
    throw buildHttpError(400, "Campo price deve ser um número.");
  }

  if (parsedPrice < 0) {
    throw buildHttpError(400, "Campo price não pode ser negativo.");
  }

  if (quantity === undefined || quantity === null || quantity === "") {
    throw buildHttpError(400, "Campo quantity é obrigatório.");
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw buildHttpError(400, "Campo quantity deve ser um número inteiro maior que zero.");
  }

  try {
    return await sellerRepository.create({
      userId,
      eventId,
      price: parsedPrice,
      quantity: parsedQuantity,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw buildHttpError(409, "Você já tem um anúncio para este evento. Edite o anúncio existente.");
    }
    throw error;
  }
}

module.exports = { createSeller };
