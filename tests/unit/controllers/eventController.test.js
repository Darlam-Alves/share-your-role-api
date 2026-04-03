const eventController = require("../../../src/controllers/event");
const eventService = require("../../../src/services/eventService");

jest.mock("../../../src/services/eventService");

function makeReq(body = {}) {
  return { body };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const CREATED_EVENT = {
  id: "uuid-event-123",
  name: "Festa do Republica",
  description: null,
  date: new Date("2026-04-10T22:00:00Z"),
  created_by_user_id: "uuid-user-123",
  created_by_republic_id: null,
  ticket_platform: null,
  ticket_url: null,
  instagram: null,
  visibility_type: "public",
  created_at: new Date("2026-03-31T00:00:00Z"),
  location: null,
  promoters: [],
};

const VALID_BODY = {
  name: "Festa do Republica",
  date: "2026-04-10T22:00:00Z",
  visibility_type: "public",
  created_by_user_id: "uuid-user-123",
};

describe("eventController.createEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    eventService.createEvent.mockResolvedValue(CREATED_EVENT);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fluxo de sucesso", () => {
    test("retorna 201 com os dados do evento criado", async () => {
      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(CREATED_EVENT);
    });

    test("repassa os campos do body para o service", async () => {
      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Festa do Republica",
          date: "2026-04-10T22:00:00Z",
          visibility_type: "public",
          created_by_user_id: "uuid-user-123",
        })
      );
    });

    test("repassa campos opcionais para o service", async () => {
      const body = {
        ...VALID_BODY,
        description: "Evento anual da república",
        instagram: "festarepublica",
        ticket_platform: "Sympla",
        ticket_url: "https://sympla.com.br/festa",
        created_by_republic_id: "uuid-republic-456",
        location: { latitude: -23.5, longitude: -46.6 },
        promoters: [{ name: "João", whatsapp: "11999999999" }],
      };
      const req = makeReq(body);
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Evento anual da república",
          instagram: "festarepublica",
          created_by_republic_id: "uuid-republic-456",
          location: { latitude: -23.5, longitude: -46.6 },
          promoters: [{ name: "João", whatsapp: "11999999999" }],
        })
      );
    });

    test("created_by_user_id vem exclusivamente do body", async () => {
      const req = makeReq({ ...VALID_BODY, created_by_user_id: "uuid-especifico" });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ created_by_user_id: "uuid-especifico" })
      );
    });
  });

  describe("propagação de erros do service", () => {
    test("retorna 400 quando o service lança erro com statusCode 400", async () => {
      const error = new Error("Campos obrigatórios: name, date, visibility_type.");
      error.statusCode = 400;
      eventService.createEvent.mockRejectedValue(error);

      const req = makeReq({});
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Campos obrigatórios: name, date, visibility_type." });
    });

    test("retorna 403 quando o service lança erro com statusCode 403", async () => {
      const error = new Error("Apenas usuários institucionais ou administradores podem criar eventos.");
      error.statusCode = 403;
      eventService.createEvent.mockRejectedValue(error);

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      eventService.createEvent.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    test("não expõe detalhes do erro interno no body da resposta 500", async () => {
      eventService.createEvent.mockRejectedValue(
        new Error("senha do banco: postgres123")
      );

      const req = makeReq(VALID_BODY);
      const res = makeRes();

      await eventController.createEvent(req, res);

      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.message).not.toContain("postgres123");
    });
  });

  describe("edge cases", () => {
    test("não quebra quando request.body é undefined", async () => {
      const error = new Error("Campos obrigatórios: name, date, visibility_type.");
      error.statusCode = 400;
      eventService.createEvent.mockRejectedValue(error);

      const req = makeReq(undefined);
      const res = makeRes();

      await expect(eventController.createEvent(req, res)).resolves.not.toThrow();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
