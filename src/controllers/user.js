const userService = require("../services/userService");

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function createUser(request, response) {
  const { name, phone, password, email_personal, email_institutional } =
    request.body || {};

  if (!hasValue(name) || !hasValue(phone) || !hasValue(password)) {
    return response
      .status(400)
      .json({ message: "Campos obrigatorios: name, phone e password." });
  }

  if (!hasValue(email_personal) && !hasValue(email_institutional)) {
    return response.status(400).json({
      message:
        "Pelo menos um dos campos email_personal ou email_institutional deve ser enviado.",
    });
  }

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
