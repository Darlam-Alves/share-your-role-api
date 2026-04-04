const prisma = require("../config/prisma");

async function findRepublicMember(userId, republicId) {
  return prisma.republic_members.findUnique({
    where: {
      user_id_republic_id: { user_id: userId, republic_id: republicId },
    },
    select: { user_id: true },
  });
}

async function create({
  name,
  description,
  date,
  endedAt,
  createdByUserId,
  createdByRepublicId,
  ticketPlatform,
  ticketUrl,
  instagram,
  visibilityType,
  location,
  promoters,
}) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.events.create({
      data: {
        name,
        description,
        date,
        ended_at: endedAt,
        created_by_user_id: createdByUserId,
        created_by_republic_id: createdByRepublicId ?? null,
        ticket_platform: ticketPlatform,
        ticket_url: ticketUrl,
        instagram,
        visibility_type: visibilityType,
      },
    });

    let eventLocation = null;
    if (location) {
      eventLocation = await tx.event_location.create({
        data: {
          event_id: event.id,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address ?? null,
          release_at: location.release_at ?? null,
        },
      });
    }

    let eventPromoters = [];
    if (promoters && promoters.length > 0) {
      await tx.event_promoters.createMany({
        data: promoters.map((p) => ({
          event_id: event.id,
          name: p.name,
          whatsapp: p.whatsapp ?? null,
          instagram: p.instagram ?? null,
          telegram: p.telegram ?? null,
        })),
      });
      eventPromoters = await tx.event_promoters.findMany({
        where: { event_id: event.id },
      });
    }

    return { ...event, location: eventLocation, promoters: eventPromoters };
  });
}

async function list({ startDate, endDate, visibilityTypes }) {
  // TODO: avaliar ordenação alternativa dentro do mesmo dia (created_at, contagem de presença confirmada)
  return prisma.events.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      visibility_type: { in: visibilityTypes },
    },
    select: {
      id: true,
      name: true,
      date: true,
      ended_at: true,
      visibility_type: true,
    },
    orderBy: { date: "asc" },
  });
}

async function findById(id) {
  return prisma.events.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      date: true,
      ended_at: true,
      visibility_type: true,
      instagram: true,
      ticket_platform: true,
      ticket_url: true,
      created_by_user: {
        select: {
          name: true,
        },
      },
      event_location: true,
      event_promoters: {
        select: {
          id: true,
          name: true,
          whatsapp: true,
          instagram: true,
          telegram: true,
        },
      },
    },
  });
}

module.exports = { findRepublicMember, create, list, findById };
