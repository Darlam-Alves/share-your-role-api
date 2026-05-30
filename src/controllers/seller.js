const sellerService = require("../services/sellerService");

async function createSeller(request, response) {
  const { id: event_id } = request.params; // Extrai da URL /events/:id/sellers
  const { price, quantity } = request.body || {};
  const user_id = request.user.id; // Usuário logado pelo middleware 'authenticate'

  try {
    const seller = await sellerService.createSeller({
      event_id,
      user_id,
      price,
      quantity,
    });

    return response.status(201).json(seller);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao criar anúncio de vendedor:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  createSeller,
};