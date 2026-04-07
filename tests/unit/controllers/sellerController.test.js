const sellerController = require("../../../src/controllers/seller");
const sellerService = require("../../../src/services/sellerService");

jest.mock("../../../src/services/sellerService");

function makeReq({ body = {}, params = {}, user = {} } = {}) {
  return { body, params, user };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CREATED_SELLER = {
  id: "uuid-seller-123",
  event_id: "uuid-event-123",
  user_id: "uuid-user-123",
  price: "40.00",
  quantity: 1,
  status: "open",
  created_at: new Date(),
};

describe("sellerController.createSeller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    sellerService.createSeller.mockResolvedValue(CREATED_SELLER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fluxo de sucesso", () => {
    test("retorna 201 com os dados do seller criado", async () => {
      const req = makeReq({
        params: { id: "uuid-event-123" },
        body: { price: 40, quantity: 1 },
        user: { id: "uuid-user-123" },
      });
      const res = makeRes();

      await sellerController.createSeller(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(CREATED_SELLER);
    });

    test("repassa eventId, userId, price e quantity para o service", async () => {
      const req = makeReq({
        params: { id: "uuid-event-123" },
        body: { price: 40, quantity: 1 },
        user: { id: "uuid-user-123" },
      });
      const res = makeRes();

      await sellerController.createSeller(req, res);

      expect(sellerService.createSeller).toHaveBeenCalledWith({
        eventId: "uuid-event-123",
        userId: "uuid-user-123",
        price: 40,
        quantity: 1,
      });
    });
  });

  describe("propagação de erros do service", () => {
    test("retorna 404 quando o service lança erro com statusCode 404", async () => {
      const error = new Error("Evento não encontrado.");
      error.statusCode = 404;
      sellerService.createSeller.mockRejectedValue(error);

      const req = makeReq({ params: { id: "uuid-inexistente" }, body: { price: 40, quantity: 1 }, user: { id: "uuid-user-123" } });
      const res = makeRes();

      await sellerController.createSeller(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Evento não encontrado." });
    });

    test("retorna 400 quando o service lança erro com statusCode 400", async () => {
      const error = new Error("Campo price é obrigatório.");
      error.statusCode = 400;
      sellerService.createSeller.mockRejectedValue(error);

      const req = makeReq({ params: { id: "uuid-event-123" }, body: {}, user: { id: "uuid-user-123" } });
      const res = makeRes();

      await sellerController.createSeller(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      sellerService.createSeller.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq({ params: { id: "uuid-event-123" }, body: { price: 40, quantity: 1 }, user: { id: "uuid-user-123" } });
      const res = makeRes();

      await sellerController.createSeller(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
