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

async function listSellers(request, response) {
    const { id: event_id } = request.params;
  
    try {
      const sellers = await sellerService.listSellersByEvent(event_id);
      return response.status(200).json(sellers);
    } catch (error) {
      if (error.statusCode) {
        return response.status(error.statusCode).json({ message: error.message });
      }
  
      console.error("Erro ao listar vendedores:", error);
      return response.status(500).json({ message: "Erro interno do servidor." });
    }
  }

module.exports = {
  createSeller,
  listSellers
};