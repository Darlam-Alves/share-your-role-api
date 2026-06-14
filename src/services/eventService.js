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
const WHATSAPP_DIGITS_REGEX = /^\d{10,13}$/;
const TELEGRAM_HANDLE_REGEX = /^@[a-zA-Z0-9_]{5,32}$/;
const EVENT_IMAGE_DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
const MAX_EVENT_IMAGE_URL_LENGTH = 3_000_000;

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

function normalizeWhatsapp(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!WHATSAPP_DIGITS_REGEX.test(digits)) {
    throw buildHttpError(
      400,
      "WhatsApp inválido. Use DDD + número, com 10 a 13 dígitos."
    );
  }
  return digits;
}

function normalizeTelegram(value) {
  const raw = toOptionalTrimmedString(value);
  if (!raw) return null;
  const handle = raw.startsWith("@") ? raw : `@${raw}`;
  if (!TELEGRAM_HANDLE_REGEX.test(handle)) {
    throw buildHttpError(
      400,
      "Telegram inválido. Use @usuario com letras, números ou underscore, de 5 a 32 caracteres."
    );
  }
  return handle.toLowerCase();
}

function normalizeEventImageUrl(value) {
  const imageUrl = toOptionalTrimmedString(value);
  if (!imageUrl) return null;

  if (imageUrl.length > MAX_EVENT_IMAGE_URL_LENGTH) {
    throw buildHttpError(400, "A imagem do evento deve ter no máximo 2 MB.");
  }

  const isDataUrl = EVENT_IMAGE_DATA_URL_REGEX.test(imageUrl);
  const isRemoteUrl = /^https?:\/\/.+/i.test(imageUrl);

  if (!isDataUrl && !isRemoteUrl) {
    throw buildHttpError(400, "Imagem do evento inválida. Use PNG, JPG ou WEBP.");
  }

  return imageUrl;
}

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEventPayload(
  payload,
  { requireCreator = false, permissionAction = "criar", preserveMissingRelations = false } = {}
) {
  const name = toOptionalTrimmedString(payload.name);
  const description = toOptionalTrimmedString(payload.description);
  const imageUrl = normalizeEventImageUrl(payload.image_url);
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

  if (parsedDate <= new Date()) {
    throw buildHttpError(400, "O evento deve começar em uma data e horário futuros.");
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

  if (requireCreator && !createdByUserId) {
    throw buildHttpError(400, "Campo created_by_user_id é obrigatório.");
  }

  const userRole = toOptionalTrimmedString(payload.user_role);
  if (!ALLOWED_ROLES.includes(userRole)) {
    throw buildHttpError(403, `Apenas usuários institucionais ou administradores podem ${permissionAction} eventos.`);
  }

  // Normalize location
  let location = preserveMissingRelations ? undefined : null;
  if (payload.location === null) {
    location = null;
  } else if (payload.location !== undefined) {
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
  let promoters = preserveMissingRelations ? undefined : null;
  if (payload.promoters === null) {
    promoters = null;
  } else if (payload.promoters !== undefined) {
    if (!Array.isArray(payload.promoters)) {
      throw buildHttpError(400, "Campo promoters deve ser um array.");
    }
    promoters = payload.promoters.map((p) => ({
      name: toOptionalTrimmedString(p.name),
      whatsapp: normalizeWhatsapp(p.whatsapp),
      instagram: normalizeInstagram(p.instagram),
      telegram: normalizeTelegram(p.telegram),
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

  return {
    name,
    description,
    imageUrl,
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
  };
}

function handleEventWriteError(error) {
  if (error?.code === "P2002") {
    const target = error.meta?.target ?? [];
    if (target.includes("whatsapp")) {
      throw buildHttpError(409, "Esse WhatsApp já está cadastrado como promoter neste evento.");
    }
    if (target.includes("instagram")) {
      throw buildHttpError(409, "Esse Instagram já está cadastrado como promoter neste evento.");
    }
    if (target.includes("telegram")) {
      throw buildHttpError(409, "Esse Telegram já está cadastrado como promoter neste evento.");
    }
    throw buildHttpError(409, "Já existe um evento com esse nome nessa data.");
  }
  throw error;
}

async function createEvent(payload) {
  const eventData = normalizeEventPayload(payload, { requireCreator: true });
  const creator = await userRepository.findById(eventData.createdByUserId);

  if (!creator) {
    throw buildHttpError(404, "Usuário não encontrado.");
  }

  // Validate republic membership if provided
  if (eventData.createdByRepublicId) {
    const member = await eventRepository.findRepublicMember(
      eventData.createdByUserId,
      eventData.createdByRepublicId
    );
    if (!member) {
      throw buildHttpError(403, "Usuário não é membro da república informada.");
    }
  }

  try {
    return await eventRepository.create(eventData);
  } catch (error) {
    handleEventWriteError(error);
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

  // TODO: quando JWT estiver implementado, incluir institutional_only para email_institutional_verified = true
  return eventRepository.list({
    startDate,
    endDate,
    visibilityTypes: ["public", "institutional_only"],
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

  const { event_location, event_promoters, created_by_user, ...rest } = event;

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
    organized_by: created_by_user,
    location,
    promoters: event_promoters,
  };
}

async function deleteEvent({ id, requesterUserId }) {
  const eventId = toOptionalTrimmedString(id);
  const userId = toOptionalTrimmedString(requesterUserId);

  if (!eventId) {
    throw buildHttpError(400, "Parâmetro id é obrigatório.");
  }

  if (!userId) {
    throw buildHttpError(401, "Usuário autenticado é obrigatório.");
  }

  const event = await eventRepository.findOwnerById(eventId);

  if (!event) {
    throw buildHttpError(404, "Evento não encontrado.");
  }

  if (event.created_by_user_id !== userId) {
    throw buildHttpError(403, "Apenas o usuário que criou o evento pode removê-lo.");
  }

  await eventRepository.removeById(eventId);
}

async function updateEvent(payload) {
  const eventId = toOptionalTrimmedString(payload.id);
  const userId = toOptionalTrimmedString(payload.requesterUserId);

  if (!eventId) {
    throw buildHttpError(400, "Parâmetro id é obrigatório.");
  }

  if (!userId) {
    throw buildHttpError(401, "Usuário autenticado é obrigatório.");
  }

  const event = await eventRepository.findOwnerById(eventId);

  if (!event) {
    throw buildHttpError(404, "Evento não encontrado.");
  }

  if (event.created_by_user_id !== userId) {
    throw buildHttpError(403, "Apenas o usuário que criou o evento pode editá-lo.");
  }

  const { createdByUserId, createdByRepublicId, ...eventData } = normalizeEventPayload(
    payload,
    {
      permissionAction: "alterar",
      preserveMissingRelations: true,
    }
  );

  try {
    return await eventRepository.updateById({
      id: eventId,
      ...eventData,
    });
  } catch (error) {
    handleEventWriteError(error);
  }
}

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  deleteEvent,
  updateEvent,
};
