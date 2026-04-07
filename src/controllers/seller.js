const sellerService = require("../services/sellerService");

async function createSeller(request, response) {
  const { id: eventId } = request.params;
  const { price, quantity } = request.body || {};

  try {
    const seller = await sellerService.createSeller({
      eventId,
      userId: request.user.id,
      price,
      quantity,
    });

    return response.status(201).json(seller);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ error: error.message });
    }

    console.error("Erro ao criar seller:", error);
    return response.status(500).json({ error: "Erro interno do servidor." });
  }
}

module.exports = { createSeller };
