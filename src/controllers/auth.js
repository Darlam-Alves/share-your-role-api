const authService = require("../services/authService");

async function login(request, response) {
  try {
    const result = await authService.login(request.body);
    return response.status(200).json(result);
  } catch (error) {
    const status = error.statusCode ?? 500;
    return response.status(status).json({ error: error.message });
  }
}

module.exports = { login };
