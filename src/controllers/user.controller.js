const userService = require("../services/userService");

async function createUser(request, response) {
  const { name, phone, password, email_personal, email_institutional } = request.body || {};

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
    // Mapeando os erros de negócio para Status HTTP
    if (error instanceof userService.ValidationError) {
      return response.status(400).json({ message: error.message });
    }
    
    if (error instanceof userService.ConflictError) {
      return response.status(409).json({ message: error.message });
    }

    // Erro genérico/inesperado
    console.error("Erro ao cadastrar usuário:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  createUser,
};
