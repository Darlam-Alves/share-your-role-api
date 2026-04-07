const authController = require("../../../src/controllers/auth");
const authService = require("../../../src/services/authService");

jest.mock("../../../src/services/authService");

function makeReq({ body = {} } = {}) {
  return { body };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const LOGIN_RESPONSE = {
  token: "jwt-token-123",
  user: { id: "uuid-user-123", name: "Ana Silva", role: "institutional" },
};

describe("authController.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    authService.login.mockResolvedValue(LOGIN_RESPONSE);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fluxo de sucesso", () => {
    test("retorna 200 com token e dados do usuário", async () => {
      const req = makeReq({ body: { email: "ana@gmail.com", password: "senha123" } });
      const res = makeRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(LOGIN_RESPONSE);
    });

    test("repassa email e password para o service", async () => {
      const req = makeReq({ body: { email: "ana@gmail.com", password: "senha123" } });
      const res = makeRes();

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith({ email: "ana@gmail.com", password: "senha123" });
    });
  });

  describe("propagação de erros do service", () => {
    test("retorna 400 quando o service lança erro com statusCode 400", async () => {
      const error = new Error("Campos obrigatórios: email, password.");
      error.statusCode = 400;
      authService.login.mockRejectedValue(error);

      const req = makeReq({ body: {} });
      const res = makeRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Campos obrigatórios: email, password." });
    });

    test("retorna 401 quando o service lança erro com statusCode 401", async () => {
      const error = new Error("Email ou senha inválidos.");
      error.statusCode = 401;
      authService.login.mockRejectedValue(error);

      const req = makeReq({ body: { email: "ana@gmail.com", password: "errada" } });
      const res = makeRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Email ou senha inválidos." });
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      authService.login.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq({ body: { email: "ana@gmail.com", password: "senha123" } });
      const res = makeRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
