const prisma = require("../config/prisma");

function buildEmailFilters({ emailPersonal, emailInstitutional }) {
  const filters = [];

  if (emailPersonal) {
    filters.push({ email_personal: emailPersonal });
  }

  if (emailInstitutional) {
    filters.push({ email_institutional: emailInstitutional });
  }

  return filters;
}

async function findByEmails({ emailPersonal, emailInstitutional }) {
  const emailFilters = buildEmailFilters({ emailPersonal, emailInstitutional });

  if (emailFilters.length === 0) {
    return null;
  }

  return prisma.users.findFirst({
    where: {
      OR: emailFilters,
    },
    select: {
      id: true,
      email_personal: true,
      email_institutional: true,
    },
  });
}

async function create({
  name,
  phone,
  emailPersonal,
  emailInstitutional,
  passwordHash,
  role,
}) {
  return prisma.users.create({
    data: {
      name,
      phone,
      email_personal: emailPersonal,
      email_institutional: emailInstitutional,
      password_hash: passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      role: true,
      created_at: true,
    },
  });
}

async function findById(id) {
  return prisma.users.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
}

async function getMyProfile(id) {
  return prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      role: true,
      email_personal: true,
      email_institutional: true,
      email_institutional_verified: true,
      phone: true,
      profile_image_url: true,
      resale_whatsapp: true,
      resale_instagram: true,
      resale_telegram: true,
      created_at: true,
    },
  });
}

async function getPublicProfile(id) {
  return prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      phone: true,
      profile_image_url: true,
      resale_whatsapp: true,
      resale_instagram: true,
      resale_telegram: true,
      created_at: true,
    },
  });
}

async function updateProfile(id, {
  name,
  bio,
  phone,
  profileImageUrl,
  resaleWhatsapp,
  resaleInstagram,
  resaleTelegram,
}) {
  return prisma.users.update({
    where: { id },
    data: {
      name,
      bio,
      phone,
      profile_image_url: profileImageUrl,
      resale_whatsapp: resaleWhatsapp,
      resale_instagram: resaleInstagram,
      resale_telegram: resaleTelegram,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      role: true,
      email_personal: true,
      email_institutional: true,
      email_institutional_verified: true,
      phone: true,
      profile_image_url: true,
      resale_whatsapp: true,
      resale_instagram: true,
      resale_telegram: true,
      created_at: true,
    },
  });
}

async function getEventsByUserId(userId) {
  return prisma.events.findMany({
    where: {
      created_by_user_id: userId,
    },
    select: {
      id: true,
      name: true,
      image_url: true,
      date: true,
      ended_at: true,
      visibility_type: true,
      ticket_platform: true,
      ticket_url: true,
      created_at: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

async function findByEmail(email) {
  return prisma.users.findFirst({
    where: {
      OR: [
        { email_personal: email },
        { email_institutional: email },
      ],
    },
    select: {
      id: true,
      name: true,
      role: true,
      email_personal: true,
      email_institutional: true,
      email_institutional_verified: true,
      password_hash: true,
    },
  });
}

module.exports = {
  findByEmails,
  findById,
  getMyProfile,
  getPublicProfile,
  updateProfile,
  getEventsByUserId,
  findByEmail,
  create,
};
