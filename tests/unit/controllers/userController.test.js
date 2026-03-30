const userController = require("../../../src/controllers/user");
const userService = require("../../../src/services/userService");

jest.mock("../../../src/services/userService");

function makeReq(body = {}) {
  return { body };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CREATED_USER = {
  id: "uuid-abc-123",
  name: "Ana Silva",
  role: "public",
  created_at: new Date("2026-01-01T00:00:00Z"),
};

const VALID_BODY = {
  name: "Ana Silva",
  phone: "11999999999",
  password: "senha123",
  email_personal: "ana@gmail.com",
};

describe("userController.createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    userService.createUser.mockResolvedValue(CREATED_USER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fluxo de sucesso", () => {
    test("retorna 201 com os dados do usuário criado", async () => {
      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(CREATED_USER);
    });

    test("repassa os campos do body para o service", async () => {
      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Ana Silva",
          phone: "11999999999",
          password: "senha123",
          email_personal: "ana@gmail.com",
        })
      );
    });

    test("aceita body com email_institutional no lugar de email_personal", async () => {
      const req = makeReq({
        ...VALID_BODY,
        email_personal: undefined,
        email_institutional: "ana@universidade.edu.br",
      });
      const res = makeRes();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("propagação de erros do service", () => {
    test("usa o statusCode do erro quando o service lança erro com statusCode", async () => {
      const error = new Error("Email ja cadastrado no sistema.");
      error.statusCode = 409;
      userService.createUser.mockRejectedValue(error);

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email ja cadastrado no sistema." });
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      userService.createUser.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    test("não expõe detalhes do erro interno no body da resposta 500", async () => {
      userService.createUser.mockRejectedValue(
        new Error("senha do banco de dados: postgres123")
      );

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await userController.createUser(req, res);

      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.message).not.toContain("postgres123");
    });
  });

  describe("edge cases", () => {
    test("não quebra quando request.body é undefined", async () => {
      const error = new Error("Campos obrigatorios: name, phone e password.");
      error.statusCode = 400;
      userService.createUser.mockRejectedValue(error);

      const req = makeReq(undefined);
      const res = makeRes();

      await expect(
        userController.createUser(req, res)
      ).resolves.not.toThrow();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
