const eventRepository = require("../models/event");
const userRepository = require("../models/user");

const VALID_VISIBILITY_TYPES = ["public", "institutional_only", "private"];
const ALLOWED_ROLES = ["institutional", "admin"];

const TICKET_PLATFORM_MAP = {
  "blacktag.com.br": "Blacktag",
  "byma.com.br": "Byma",
  "sympla.com.br": "Sympla",
  "eventbrite.com.br": "Eventbrite",
  "eventbrite.com": "Eventbrite",
  "ingresse.com": "Ingresse",
  "cheers.com.br": "Cheers",
};

function deriveTicketPlatform(url) {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return TICKET_PLATFORM_MAP[hostname] ?? hostname;
  } catch {
    return null;
  }
}

function toOptionalTrimmedString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const INSTAGRAM_HANDLE_REGEX = /^@[a-zA-Z0-9_.]{1,30}$/;

function normalizeInstagram(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;
  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (!INSTAGRAM_HANDLE_REGEX.test(handle)) {
    throw buildHttpError(
      400,
      "Instagram inválido. Use o formato @usuario (letras, números, pontos e underscores, até 30 caracteres)."
    );
  }
  return handle.toLowerCase();
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
  const instagram = normalizeInstagram(payload.instagram);
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
      instagram: normalizeInstagram(p.instagram),
      telegram: toOptionalTrimmedString(p.telegram),
    }));

    if (promoters.some((p) => !p.name)) {
      throw buildHttpError(400, "Cada promoter deve ter o campo name.");
    }

    if (promoters.some((p) => !p.whatsapp && !p.instagram && !p.telegram)) {
      throw buildHttpError(400, "Cada promoter deve ter ao menos um contato: whatsapp, instagram ou telegram.");
    }
  }

  // Validate contact channel: instagram do evento ou ao menos um promoter com instagram/whatsapp
  const hasContactChannel =
    !!instagram ||
    (Array.isArray(promoters) && promoters.some((p) => p.instagram || p.whatsapp));

  if (!hasContactChannel) {
    throw buildHttpError(
      400,
      "O evento deve ter instagram ou ao menos um promoter com instagram ou whatsapp."
    );
  }

  try {
    return await eventRepository.create({
      name,
      description,
      date: parsedDate,
      endedAt,
      visibilityType,
      instagram,
      ticketPlatform: deriveTicketPlatform(ticketUrl),
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

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function listEvents(payload) {
  const startDateStr = toOptionalTrimmedString(payload.start_date);
  const endDateStr = toOptionalTrimmedString(payload.end_date);

  if (!startDateStr || !endDateStr) {
    throw buildHttpError(400, "Parâmetros obrigatórios: start_date, end_date.");
  }

  if (!DATE_REGEX.test(startDateStr)) {
    throw buildHttpError(400, "Campo start_date deve estar no formato YYYY-MM-DD.");
  }

  if (!DATE_REGEX.test(endDateStr)) {
    throw buildHttpError(400, "Campo end_date deve estar no formato YYYY-MM-DD.");
  }

  const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
  const endDate = new Date(`${endDateStr}T23:59:59.999Z`);

  if (endDate < startDate) {
    throw buildHttpError(400, "Campo end_date deve ser posterior a start_date.");
  }

  const isInstitutionalVerified = !!payload.institutionalVerified; // TODO: extrair de req.user.email_institutional_verified (JWT)

  const events = await eventRepository.list({
    startDate,
    endDate,
    visibilityTypes: ["public", "institutional_only"],
  });

  const now = new Date();
  return events.map(({ event_location, ...event }) => {
    const isInstitutionalOnly = event.visibility_type === "institutional_only";

    // Localização de eventos institutional_only é visível apenas para usuários com email institucional verificado
    if (isInstitutionalOnly && !isInstitutionalVerified) {
      return { ...event, location: null };
    }

    if (!event_location) return { ...event, location: null };

    const embargoed = event_location.release_at && event_location.release_at > now;

    return {
      ...event,
      location: embargoed
        ? { address: event_location.address }
        : {
            address: event_location.address,
            latitude: event_location.latitude,
            longitude: event_location.longitude,
          },
    };
  });
}

async function getEventById(id) {
  if (!toOptionalTrimmedString(id)) {
    throw buildHttpError(400, "Parâmetro id é obrigatório.");
  }

  const event = await eventRepository.findById(id);
  if (!event) {
    throw buildHttpError(404, "Evento não encontrado.");
  }

  const { event_location, event_promoters, ...rest } = event;

  const now = new Date();
  let location = null;
  if (event_location) {
    const embargoed = event_location.release_at && event_location.release_at > now;
    location = embargoed
      ? { address: event_location.address }
      : {
          address: event_location.address,
          latitude: event_location.latitude,
          longitude: event_location.longitude,
        };
  }

  return {
    ...rest,
    location,
    promoters: event_promoters,
  };
}

module.exports = { createEvent, listEvents, getEventById };
