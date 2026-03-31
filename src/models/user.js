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

module.exports = {
  findByEmails,
  create,
};
