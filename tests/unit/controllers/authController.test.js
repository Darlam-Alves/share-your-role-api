const authController = require("../../../src/controllers/auth.controllers.js");
const authService = require("../../../src/services/authService");

// Dizemos ao Jest para "mockar" (simular) o nosso service
jest.mock("../../../src/services/authService");

describe("Auth Controller - POST /auth/login", () => {
  let request;
  let response;

  // Antes de CADA teste, nós limpamos os mocks e recriamos o request/response
  beforeEach(() => {
    request = {
      body: {},
    };
    response = {
      status: jest.fn().mockReturnThis(), // Permite encadear res.status().json()
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("deve retornar status 200 e um token em caso de sucesso", async () => {
    // Preparação (Arrange)
    request.body = { email: "carlos@gmail.com", password: "senha123" };
    const mockResult = { token: "eyJhbGciOiJIUzI1NiJ9.fake.token" };
    
    // Forçamos o service a dar sucesso e retornar o mockResult
    authService.login.mockResolvedValue(mockResult);

    // Ação (Act)
    await authController.login(request, response);

    // Verificação (Assert)
    expect(authService.login).toHaveBeenCalledWith({
      email: "carlos@gmail.com",
      password: "senha123",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(mockResult);
  });

  it("deve retornar status 400 se e-mail ou senha não forem enviados", async () => {
    // Preparação: simulamos que o service disparou um ValidationError
    const mockError = new authService.ValidationError("E-mail e senha são obrigatórios.");
    authService.login.mockRejectedValue(mockError);

    // Ação
    await authController.login(request, response);

    // Verificação
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: mockError.message });
  });

  it("deve retornar status 401 se as credenciais forem inválidas", async () => {
    request.body = { email: "carlos@gmail.com", password: "senha_errada" };
    
    // Preparação: simulamos que o service disparou um UnauthorizedError
    const mockError = new authService.UnauthorizedError("Credenciais inválidas.");
    authService.login.mockRejectedValue(mockError);

    // Ação
    await authController.login(request, response);

    // Verificação
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: mockError.message });
  });

  it("deve retornar status 500 se ocorrer um erro inesperado no servidor", async () => {
    request.body = { email: "carlos@gmail.com", password: "senha123" };
    
    // Preparação: simulamos um erro genérico (ex: banco caiu)
    authService.login.mockRejectedValue(new Error("Erro de conexão com o banco"));

    // Oculta o console.error temporariamente para não poluir o terminal durante o teste
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Ação
    await authController.login(request, response);

    // Verificação
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: "Erro interno do servidor." });
    
    // Restaura o console.error
    console.error.mockRestore();
  });
});
