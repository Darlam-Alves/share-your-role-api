const userService = require("../services/userService");

async function createUser(request, response) {
  const { name, phone, password, email_personal, email_institutional } =
    request.body || {};

  try {
    const createdUser = await userService.createUser({
      name,
      phone,
      password,
      email_personal,
      email_institutional,
    });

    return response.status(201).json(createdUser);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao cadastrar usuario:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function getMyProfile(request, response) {
  try {
    const profile = await userService.getMyProfile(request.user.id);
    return response.status(200).json(profile);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao buscar perfil:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function updateMyProfile(request, response) {
  try {
    const profile = await userService.updateMyProfile(request.user.id, request.body || {});
    return response.status(200).json(profile);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao atualizar perfil:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function getPublicProfile(request, response) {
  try {
    const profile = await userService.getPublicProfile(request.params.id);
    return response.status(200).json(profile);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao buscar perfil público:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function getMyEvents(request, response) {
  try {
    const events = await userService.getMyEvents(request.user.id);
    return response.status(200).json(events);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao buscar eventos do usuário:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

async function getMyResales(request, response) {
  try {
    const resales = await userService.getMyResales(request.user.id);
    return response.status(200).json(resales);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao buscar revendas do usuário:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  createUser,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getMyEvents,
  getMyResales
};
