const eventService = require("../services/eventService");

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

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
