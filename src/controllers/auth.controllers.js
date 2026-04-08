const authService = require("../services/authService");

async function login(request, response) {
  const { email, password } = request.body || {};

  try {
    const result = await authService.login({ email, password });
    
    // Resposta de sucesso — 200
    return response.status(200).json(result);
  } catch (error) {
    if (error instanceof authService.ValidationError) {
      return response.status(400).json({ message: error.message });
    }

    if (error instanceof authService.UnauthorizedError) {
      return response.status(401).json({ message: error.message });
    }

    console.error("Erro no login:", error);
    return response.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  login,
};
