const authService = require("../../../src/services/authService");
const userRepository = require("../../../src/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../../src/models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const VALID_USER = {
  id: "uuid-user-123",
  name: "Ana Silva",
  role: "institutional",
  email_institutional_verified: false,
  password_hash: "$2b$10$hashedpassword",
};

describe("authService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    userRepository.findByEmail.mockResolvedValue(VALID_USER);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocked-token");
  });

  describe("validação de campos obrigatórios", () => {
    test("lança erro 400 quando email não é enviado", async () => {
      await expect(authService.login({ password: "senha123" })).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("email"),
      });
    });

    test("lança erro 400 quando password não é enviado", async () => {
      await expect(authService.login({ email: "ana@gmail.com" })).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("password"),
      });
    });

    test("lança erro 400 quando email é string vazia", async () => {
      await expect(authService.login({ email: "   ", password: "senha123" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    test("lança erro 400 quando password é string vazia", async () => {
      await expect(authService.login({ email: "ana@gmail.com", password: "   " })).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("autenticação", () => {
    test("lança erro 401 quando usuário não existe", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: "naoexiste@gmail.com", password: "senha123" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    test("lança erro 401 quando senha está incorreta", async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: "ana@gmail.com", password: "senhaerrada" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    test("mensagem de erro não revela se foi o email ou a senha que falhou", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(false);

      const error = await authService.login({ email: "naoexiste@gmail.com", password: "senha123" }).catch(e => e);

      expect(error.message).toBe("Email ou senha inválidos.");
    });
  });

  describe("normalização de inputs", () => {
    test("normaliza o email com trim e lowercase antes de buscar", async () => {
      await authService.login({ email: "  ANA@GMAIL.COM  ", password: "senha123" });

      expect(userRepository.findByEmail).toHaveBeenCalledWith("ana@gmail.com");
    });
  });

  describe("fluxo de sucesso", () => {
    test("retorna token e dados do usuário", async () => {
      const result = await authService.login({ email: "ana@gmail.com", password: "senha123" });

      expect(result).toEqual({
        token: "mocked-token",
        user: { id: "uuid-user-123", name: "Ana Silva", role: "institutional" },
      });
    });

    test("gera JWT com payload correto", async () => {
      await authService.login({ email: "ana@gmail.com", password: "senha123" });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: "uuid-user-123",
          role: "institutional",
          email_institutional_verified: false,
        },
        "test-secret",
        { expiresIn: "7d" }
      );
    });

    test("não expõe password_hash no retorno", async () => {
      const result = await authService.login({ email: "ana@gmail.com", password: "senha123" });

      expect(JSON.stringify(result)).not.toContain("password_hash");
      expect(JSON.stringify(result)).not.toContain("hashedpassword");
    });
  });
});
