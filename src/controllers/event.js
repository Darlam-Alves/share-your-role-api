const eventService = require("../services/eventService");
const prisma = require("../config/prisma");

async function createEvent(request, response) {
  const {
    name,
    description,
    image_url,
    date,
    ended_at,
    visibility_type,
    instagram,
    ticket_url,
    created_by_republic_id,
    location,
    promoters,
  } = request.body || {};

  try {
    const event = await eventService.createEvent({
      name,
      description,
      image_url,
      date,
      ended_at,
      visibility_type,
      instagram,
      ticket_url,
      created_by_user_id: request.user.id,
      user_role: request.user.role,
      created_by_republic_id,
      location,
      promoters,
    });

    return response.status(201).json(event);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao criar evento:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function listEvents(request, response) {
  const { start_date, end_date } = request.query;

  try {
    const events = await eventService.listEvents({ start_date, end_date });
    return response.status(200).json(events);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao listar eventos:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function getEventById(request, response) {
  const { id } = request.params;

  try {
    const event = await eventService.getEventById(id);
    return response.status(200).json(event);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao buscar evento:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}
async function createEventResale(request, response) {
  try {
    const eventId = request.params.id;
    const userId = request.user.id; 
    const { price, quantity } = request.body;

    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: { created_by_user_id: true }
    });

    if (!event) {
      return response.status(404).json({ error: "Evento não encontrado." });
    }

    if (event.created_by_user_id === userId) {
      return response.status(400).json({ 
        error: "O organizador do evento não pode criar anúncios de revenda para o próprio evento." 
      });
    }

    const existingResale = await prisma.resales.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
        status: "open" // Apenas barra se o anúncio ainda estiver ativo/aberto
      }
    });
    if (existingResale) {
      return response.status(400).json({ 
        message: "Você já possui um anúncio ativo de revenda para este evento. Cancele ou edite o anterior." 
      });
    }

    const newResale = await prisma.resales.create({
      data: {
        user_id: userId,
        event_id: eventId,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        status: "open"
      }
    });

    return response.status(201).json(newResale);
  } catch (error) {
    console.error("Erro ao criar revenda:", error);
    return response.status(500).json({ error: "Erro interno ao processar revenda." });
  }
}

async function getEventResales(request, response) {
  try {
    const eventId = request.params.id;
    const resales = await prisma.resales.findMany({
      where: {
        event_id: eventId,
        status: "open", // Mostra apenas as que estão abertas
      },
      include: {
        user: true, // Inclui o usuário/vendedor
      },
    });
    return response.status(200).json(resales);
  } catch (error) {
    console.error("Erro ao buscar revendas do evento:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function updateEvent(request, response) {
  const { id } = request.params;
  const {
    name,
    description,
    image_url,
    date,
    ended_at,
    visibility_type,
    instagram,
    ticket_url,
    location,
    promoters,
  } = request.body || {};

  try {
    const event = await eventService.updateEvent({
      id,
      name,
      description,
      image_url,
      date,
      ended_at,
      visibility_type,
      instagram,
      ticket_url,
      location,
      promoters,
      requesterUserId: request.user.id,
      user_role: request.user.role,
    });

    return response.status(200).json(event);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao editar evento:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function deleteEvent(request, response) {
  const { id } = request.params;

  try {
    await eventService.deleteEvent({
      id,
      requesterUserId: request.user.id,
    });

    return response.status(204).send();
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao remover evento:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function updateEventResale(request, response) {
  try {
    const resaleId = request.params.id;
    const userId = request.user.id; // Usuário logado vindo do middleware
    const { price, quantity } = request.body;

    // 1. Busca a revenda para validar o dono
    const resale = await prisma.resales.findUnique({
      where: { id: resaleId }
    });

    if (!resale) {
      return response.status(404).json({ message: "Anúncio de revenda não encontrado." });
    }

    // 2. 🚨 Trava de Segurança: impede que um usuário edite o anúncio de outro
    if (resale.user_id !== userId) {
      return response.status(403).json({ message: "Você não tem permissão para alterar este anúncio." });
    }

    // 3. Atualiza os dados
    const updatedResale = await prisma.resales.update({
      where: { id: resaleId },
      data: {
        price: price ? parseFloat(price) : resale.price,
        quantity: quantity ? parseInt(quantity, 10) : resale.quantity
      }
    });

    return response.status(200).json(updatedResale);
  } catch (error) {
    console.error("Erro ao atualizar revenda:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

// 🛠️ FUNÇÃO PARA DELETAR A REVENDA
async function deleteEventResale(request, response) {
  try {
    const resaleId = request.params.id;
    const userId = request.user.id;

    // 1. Busca a revenda para validar o dono
    const resale = await prisma.resales.findUnique({
      where: { id: resaleId }
    });

    if (!resale) {
      return response.status(404).json({ message: "Anúncio de revenda não encontrado." });
    }

    // 2. 🚨 Trava de Segurança
    if (resale.user_id !== userId) {
      return response.status(403).json({ message: "Você não tem permissão para deletar este anúncio." });
    }

    // 3. Remove do banco (ou muda o status para 'cancelled', se preferir manter histórico)
    await prisma.resales.delete({
      where: { id: resaleId }
    });

    return response.status(204).send(); // 204 significa sucesso sem conteúdo de retorno
  } catch (error) {
    console.error("Erro ao deletar revenda:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventResales,
  createEventResale,
  updateEventResale,
  deleteEventResale
};
