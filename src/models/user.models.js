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

// Usado para o Cadastro (Registo)
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

// novafuncção usada para o Login
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
      role: true,
      password_hash: true, // Obrigatório trazer a senha encriptada para o login!
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
  findByEmail, // exportação da nova função
  create,
};
