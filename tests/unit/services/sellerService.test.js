const sellerService = require("../../../src/services/sellerService");
const sellerRepository = require("../../../src/models/seller");
const eventRepository = require("../../../src/models/event");

jest.mock("../../../src/models/seller");
jest.mock("../../../src/models/event");

const VALID_EVENT = { id: "uuid-event-123", name: "Festa do Republica" };

const VALID_PAYLOAD = {
  eventId: "uuid-event-123",
  userId: "uuid-user-123",
  price: 40,
  quantity: 1,
};

const CREATED_SELLER = {
  id: "uuid-seller-123",
  event_id: "uuid-event-123",
  user_id: "uuid-user-123",
  price: "40.00",
  quantity: 1,
  status: "open",
  created_at: new Date(),
};

describe("sellerService.createSeller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventRepository.findById.mockResolvedValue(VALID_EVENT);
    sellerRepository.create.mockResolvedValue(CREATED_SELLER);
  });

  describe("validação de evento", () => {
    test("lança erro 404 quando evento não existe", async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(sellerService.createSeller(VALID_PAYLOAD)).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining("Evento não encontrado"),
      });
    });
  });

  describe("validação de price", () => {
    test("lança erro 400 quando price não é enviado", async () => {
      const { price, ...payload } = VALID_PAYLOAD;
      await expect(sellerService.createSeller(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("price"),
      });
    });

    test("lança erro 400 quando price não é um número", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, price: "abc" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("lança erro 400 quando price é negativo", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, price: -1 })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("negativo") });
    });

    test("aceita price igual a zero", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, price: 0 })
      ).resolves.toBeDefined();
    });
  });

  describe("validação de quantity", () => {
    test("lança erro 400 quando quantity não é enviado", async () => {
      const { quantity, ...payload } = VALID_PAYLOAD;
      await expect(sellerService.createSeller(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("quantity"),
      });
    });

    test("lança erro 400 quando quantity é zero", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, quantity: 0 })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("lança erro 400 quando quantity é negativo", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, quantity: -1 })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("lança erro 400 quando quantity não é inteiro", async () => {
      await expect(
        sellerService.createSeller({ ...VALID_PAYLOAD, quantity: 1.5 })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // TODO: adicionar testes de teto de preço quando reference_price for implementado no evento

  describe("anúncio duplicado", () => {
    test("lança erro 409 quando usuário já tem anúncio no evento", async () => {
      const prismaError = new Error("Unique constraint failed");
      prismaError.code = "P2002";
      sellerRepository.create.mockRejectedValue(prismaError);

      await expect(sellerService.createSeller(VALID_PAYLOAD)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining("já tem um anúncio"),
      });
    });
  });

  describe("fluxo de sucesso", () => {
    test("retorna os dados do seller criado", async () => {
      const result = await sellerService.createSeller(VALID_PAYLOAD);

      expect(result).toEqual(CREATED_SELLER);
    });

    test("chama sellerRepository.create com os dados corretos", async () => {
      await sellerService.createSeller(VALID_PAYLOAD);

      expect(sellerRepository.create).toHaveBeenCalledWith({
        userId: "uuid-user-123",
        eventId: "uuid-event-123",
        price: 40,
        quantity: 1,
      });
    });
  });
});
