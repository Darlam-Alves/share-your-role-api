const prisma = require("../config/prisma");

// Busca um evento por ID para verificar se ele existe
async function findEventById(id) {
  return prisma.events.findUnique({
    where: { id },
    select: { id: true },
  });
}

// Busca se o usuário já tem um anúncio ativo ('open') para o mesmo evento
async function findActiveSellerByUserAndEvent(userId, eventId) {
  return prisma.sellers.findFirst({
    where: {
      user_id: userId,
      event_id: eventId,
      status: "open",
    },
    select: { id: true },
  });
}

// Cria o anúncio do vendedor no banco de dados
async function create({ userId, eventId, price, quantity }) {
  return prisma.sellers.create({
    data: {
      user_id: userId,
      event_id: eventId,
      price,
      quantity,
      status: "open", // Padrão definido no schema.sql
    },
    select: {
      id: true,
      user_id: true,
      event_id: true,
      price: true,
      quantity: true,
      status: true,
      created_at: true,
    },
  });
}

module.exports = {
  findEventById,
  findActiveSellerByUserAndEvent,
  create,
};