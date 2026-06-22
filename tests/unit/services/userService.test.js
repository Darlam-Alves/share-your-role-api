const bcrypt = require("bcrypt");
const userService = require("../../../src/services/userService");
const userRepository = require("../../../src/models/user");

jest.mock("../../../src/models/user");
jest.mock("bcrypt");

const VALID_PAYLOAD = {
  name: "Ana Silva",
  phone: "11999999999",
  password: "Senha@123",
  email_personal: "ana@gmail.com",
};

describe("userService.createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue("hashed_password");
    userRepository.findByEmails.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: "uuid-abc-123",
      name: "Ana Silva",
      role: "public",
      created_at: new Date("2026-01-01T00:00:00Z"),
    });
  });

  describe("validação de campos obrigatórios", () => {
    test("lança erro 400 quando name não é enviado", async () => {
      const { name, ...payload } = VALID_PAYLOAD;
      await expect(userService.createUser(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("name"),
      });
    });

    test("lança erro 400 quando name é string vazia", async () => {
      await expect(
        userService.createUser({ ...VALID_PAYLOAD, name: "   " })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("lança erro 400 quando phone não é enviado", async () => {
      const { phone, ...payload } = VALID_PAYLOAD;
      await expect(userService.createUser(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("phone"),
      });
    });

    test("lança erro 400 quando password não é enviado", async () => {
      const { password, ...payload } = VALID_PAYLOAD;
      await expect(userService.createUser(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("password"),
      });
    });

    test("lança erro 400 quando nenhum email é enviado", async () => {
      const { email_personal, ...payload } = VALID_PAYLOAD;
      await expect(userService.createUser(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("email"),
      });
    });
  });

  describe("segurança da senha", () => {
    test.each([
      ["Senha123", "sem símbolo"],
      ["senha@123", "sem letra maiúscula"],
      ["SENHA@123", "sem letra minúscula"],
      ["Senha@ab", "sem número"],
      ["S@1a", "com menos de 8 caracteres"],
    ])("rejeita senha %s (%s)", async (password) => {
      await expect(
        userService.createUser({ ...VALID_PAYLOAD, password })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("mínimo 8 caracteres"),
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test("aceita senha com maiúscula, minúscula, número e símbolo", async () => {
      await expect(userService.createUser(VALID_PAYLOAD)).resolves.toMatchObject({
        id: "uuid-abc-123",
      });
    });
  });

  describe("verificação de email duplicado", () => {
    test("lança erro 409 quando email já existe no banco", async () => {
      userRepository.findByEmails.mockResolvedValue({
        id: "uuid-existente",
        email_personal: "ana@gmail.com",
        email_institutional: null,
      });

      await expect(
        userService.createUser(VALID_PAYLOAD)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining("Email"),
      });
    });

    test("lança erro 409 quando create retorna P2002 (race condition)", async () => {
      const prismaUniqueError = new Error("Unique constraint failed");
      prismaUniqueError.code = "P2002";
      userRepository.create.mockRejectedValue(prismaUniqueError);

      await expect(
        userService.createUser(VALID_PAYLOAD)
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    test("propaga erros inesperados do banco sem modificar", async () => {
      const dbError = new Error("Connection refused");
      userRepository.create.mockRejectedValue(dbError);

      await expect(userService.createUser(VALID_PAYLOAD)).rejects.toBe(dbError);
    });
  });

  describe("atribuição de role", () => {
    test("atribui role 'public' quando só email_personal é enviado", async () => {
      await userService.createUser(VALID_PAYLOAD);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "public" })
      );
    });

    test("atribui role 'institutional' quando email_institutional é enviado", async () => {
      await userService.createUser({
        ...VALID_PAYLOAD,
        email_personal: undefined,
        email_institutional: "ana@universidade.edu.br",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "institutional" })
      );
    });

    test("atribui role 'institutional' quando ambos os emails são enviados", async () => {
      await userService.createUser({
        ...VALID_PAYLOAD,
        email_institutional: "ana@universidade.edu.br",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "institutional" })
      );
    });
  });

  describe("hash de senha", () => {
    test("nunca salva a senha em texto puro", async () => {
      await userService.createUser(VALID_PAYLOAD);

      expect(userRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: "Senha@123" })
      );
    });

    test("salva o hash retornado pelo bcrypt", async () => {
      await userService.createUser(VALID_PAYLOAD);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: "hashed_password" })
      );
    });

    test("usa SALT_ROUNDS = 10", async () => {
      await userService.createUser(VALID_PAYLOAD);

      expect(bcrypt.hash).toHaveBeenCalledWith("Senha@123", 10);
    });
  });

  describe("normalização de inputs", () => {
    test("remove espaços extras do name antes de salvar", async () => {
      await userService.createUser({ ...VALID_PAYLOAD, name: "  Ana Silva  " });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Ana Silva" })
      );
    });

    test("remove espaços extras do email antes de salvar", async () => {
      await userService.createUser({
        ...VALID_PAYLOAD,
        email_personal: "  ana@gmail.com  ",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ emailPersonal: "ana@gmail.com" })
      );
    });

    test("converte email_personal para lowercase antes de salvar", async () => {
      await userService.createUser({
        ...VALID_PAYLOAD,
        email_personal: "ANA@GMAIL.COM",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ emailPersonal: "ana@gmail.com" })
      );
    });

    test("converte email_institutional para lowercase antes de salvar", async () => {
      await userService.createUser({
        ...VALID_PAYLOAD,
        email_institutional: "ANA@UNICAMP.BR",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ emailInstitutional: "ana@unicamp.br" })
      );
    });

    test("e-mails com capitalização diferente são tratados como duplicata", async () => {
      userRepository.findByEmails.mockResolvedValue({
        id: "uuid-existente",
        email_personal: "ana@gmail.com",
        email_institutional: null,
      });

      await expect(
        userService.createUser({ ...VALID_PAYLOAD, email_personal: "ANA@GMAIL.COM" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("retorno", () => {
    test("retorna os dados do usuário criado pelo repositório", async () => {
      const result = await userService.createUser(VALID_PAYLOAD);

      expect(result).toEqual({
        id: "uuid-abc-123",
        name: "Ana Silva",
        role: "public",
        created_at: expect.any(Date),
      });
    });

    test("nunca retorna password_hash", async () => {
      const result = await userService.createUser(VALID_PAYLOAD);

      expect(result).not.toHaveProperty("password_hash");
      expect(result).not.toHaveProperty("passwordHash");
    });
  });
});
