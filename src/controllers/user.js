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

module.exports = {
  createUser,
};
