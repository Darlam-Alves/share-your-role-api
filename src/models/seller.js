const prisma = require("../config/prisma");

async function create({ userId, eventId, price, quantity }) {
  return prisma.sellers.create({
    data: { user_id: userId, event_id: eventId, price, quantity },
    select: {
      id: true,
      event_id: true,
      user_id: true,
      price: true,
      quantity: true,
      status: true,
      created_at: true,
    },
  });
}

module.exports = { create };
