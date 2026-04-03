const eventRepository = require("../models/event");
const userRepository = require("../models/user");

const VALID_VISIBILITY_TYPES = ["public", "institutional_only", "private"];
const ALLOWED_ROLES = ["institutional", "admin"];

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createEvent(payload) {
  // Normalize
  const name = toOptionalTrimmedString(payload.name);
  const description = toOptionalTrimmedString(payload.description);
  const visibilityType = toOptionalTrimmedString(payload.visibility_type);
  const instagram = toOptionalTrimmedString(payload.instagram)?.toLowerCase() ?? null;
  const ticketPlatform = toOptionalTrimmedString(payload.ticket_platform);
  const ticketUrl = toOptionalTrimmedString(payload.ticket_url);
  const createdByUserId = toOptionalTrimmedString(payload.created_by_user_id);
  const createdByRepublicId = toOptionalTrimmedString(payload.created_by_republic_id);
  const endedAt = payload.ended_at ? new Date(payload.ended_at) : null;


  // Validate required fields
  if (!name || !payload.date || !payload.ended_at || !visibilityType) {
    throw buildHttpError(400, "Campos obrigatórios: name, date, ended_at, visibility_type.");
  }

  const parsedDate = new Date(payload.date);
  if (isNaN(parsedDate.getTime())) {
    throw buildHttpError(400, "Campo date deve ser uma data válida");
  }

  if (endedAt !== null) {
    if (isNaN(endedAt.getTime())) {
      throw buildHttpError(400, "Campo ended_at deve ser uma data válida no formato ISO 8601.");
    }
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const THIRTEEN_HOURS_MS = 13 * 60 * 60 * 1000;
    const duration = endedAt - parsedDate;
    if (duration < THREE_HOURS_MS) {
      throw buildHttpError(400, "O evento deve ter duração mínima de 3 horas.");
    }
    if (duration > THIRTEEN_HOURS_MS) {
      throw buildHttpError(400, "O evento deve ter duração máxima de 13 horas.");
    }
  }

  if (!VALID_VISIBILITY_TYPES.includes(visibilityType)) {
    throw buildHttpError(
      400,
      `Campo visibility_type inválido. Valores aceitos: ${VALID_VISIBILITY_TYPES.join(", ")}.`
    );
  }

  if (!createdByUserId) {
    throw buildHttpError(400, "Campo created_by_user_id é obrigatório.");
  }

  // Validate user role — server-side lookup (will use req.user.role from JWT later)
  const user = await userRepository.findById(createdByUserId);
  if (!user) {
    throw buildHttpError(400, "Usuário não encontrado.");
  }
  if (!ALLOWED_ROLES.includes(user.role)) {
    throw buildHttpError(403, "Apenas usuários institucionais ou administradores podem criar eventos.");
  }

  // Validate republic membership if provided
  if (createdByRepublicId) {
    const member = await eventRepository.findRepublicMember(createdByUserId, createdByRepublicId);
    if (!member) {
      throw buildHttpError(403, "Usuário não é membro da república informada.");
    }
  }

  // Normalize location
  let location = null;
  if (payload.location) {
    const { latitude, longitude, address, release_at } = payload.location;
    if (latitude == null || longitude == null) {
      throw buildHttpError(400, "Campos latitude e longitude são obrigatórios quando location é enviado.");
    }
    location = {
      latitude,
      longitude,
      address: toOptionalTrimmedString(address),
      release_at: release_at ? new Date(release_at) : null,
    };
  }

  // Normalize promoters
  let promoters = null;
  if (payload.promoters !== undefined) {
    if (!Array.isArray(payload.promoters)) {
      throw buildHttpError(400, "Campo promoters deve ser um array.");
    }
    promoters = payload.promoters.map((p) => ({
      name: toOptionalTrimmedString(p.name),
      whatsapp: toOptionalTrimmedString(p.whatsapp),
      instagram: toOptionalTrimmedString(p.instagram)?.toLowerCase() ?? null,
      telegram: toOptionalTrimmedString(p.telegram),
    }));

    if (promoters.some((p) => !p.name)) {
      throw buildHttpError(400, "Cada promoter deve ter o campo name.");
    }
  }

  try {
    return await eventRepository.create({
      name,
      description,
      date: parsedDate,
      endedAt,
      visibilityType,
      instagram,
      ticketPlatform,
      ticketUrl,
      createdByUserId,
      createdByRepublicId,
      location,
      promoters,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw buildHttpError(409, "Já existe um evento com esse nome nessa data.");
    }
    throw error;
  }
}

module.exports = { createEvent };
