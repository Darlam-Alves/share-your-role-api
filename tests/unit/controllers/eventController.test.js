const eventController = require("../../../src/controllers/event");
const eventService = require("../../../src/services/eventService");

jest.mock("../../../src/services/eventService");

function makeReq({ body = {}, params = {}, query = {}, user = {} } = {}) {
  return { body, params, query, user };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
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

const VALID_USER = { id: "uuid-user-123", role: "institutional" };

const VALID_BODY = {
  name: "Festa do Republica",
  date: "2026-04-10T22:00:00Z",
  visibility_type: "public",
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
      const req = makeReq({ body: VALID_BODY, user: VALID_USER });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(CREATED_EVENT);
    });

    test("repassa os campos do body para o service", async () => {
      const req = makeReq({ body: VALID_BODY, user: VALID_USER });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Festa do Republica",
          date: "2026-04-10T22:00:00Z",
          visibility_type: "public",
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
      const req = makeReq({ body, user: VALID_USER });
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

    test("created_by_user_id e user_role vêm de req.user", async () => {
      const req = makeReq({ body: VALID_BODY, user: { id: "uuid-especifico", role: "admin" } });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(eventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by_user_id: "uuid-especifico",
          user_role: "admin",
        })
      );
    });
  });

  describe("propagação de erros do service", () => {
    test("retorna 400 quando o service lança erro com statusCode 400", async () => {
      const error = new Error("Campos obrigatórios: name, date, visibility_type.");
      error.statusCode = 400;
      eventService.createEvent.mockRejectedValue(error);

      const req = makeReq({ body: {} });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Campos obrigatórios: name, date, visibility_type." });
    });

    test("retorna 403 quando o service lança erro com statusCode 403", async () => {
      const error = new Error("Apenas usuários institucionais ou administradores podem criar eventos.");
      error.statusCode = 403;
      eventService.createEvent.mockRejectedValue(error);

      const req = makeReq({ body: VALID_BODY, user: VALID_USER });
      const res = makeRes();

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      eventService.createEvent.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq({ body: VALID_BODY, user: VALID_USER });
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

      const req = makeReq({ body: VALID_BODY, user: VALID_USER });
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

      const req = makeReq();
      const res = makeRes();

      await expect(eventController.createEvent(req, res)).resolves.not.toThrow();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe("eventController.listEvents", () => {
  const EVENTS_LIST = [
    {
      id: "uuid-event-1",
      name: "Festa da Engenharia",
      date: new Date("2026-04-08T22:00:00Z"),
      ended_at: new Date("2026-04-09T04:00:00Z"),
      visibility_type: "public",
      location: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    eventService.listEvents.mockResolvedValue(EVENTS_LIST);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fluxo de sucesso", () => {
    test("retorna 200 com a lista de eventos", async () => {
      const req = makeReq({ query: { start_date: "2026-04-03", end_date: "2026-04-09" } });
      const res = makeRes();

      await eventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(EVENTS_LIST);
    });

    test("repassa start_date e end_date para o service", async () => {
      const req = makeReq({ query: { start_date: "2026-04-03", end_date: "2026-04-09" } });
      const res = makeRes();

      await eventController.listEvents(req, res);

      expect(eventService.listEvents).toHaveBeenCalledWith({
        start_date: "2026-04-03",
        end_date: "2026-04-09",
      });
    });
  });

  describe("propagação de erros do service", () => {
    test("retorna 400 quando o service lança erro com statusCode 400", async () => {
      const error = new Error("Parâmetros obrigatórios: start_date, end_date.");
      error.statusCode = 400;
      eventService.listEvents.mockRejectedValue(error);

      const req = makeReq({ query: {} });
      const res = makeRes();

      await eventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Parâmetros obrigatórios: start_date, end_date." });
    });

    test("retorna 500 quando o service lança erro sem statusCode", async () => {
      eventService.listEvents.mockRejectedValue(new Error("Connection refused"));

      const req = makeReq({ query: { start_date: "2026-04-03", end_date: "2026-04-09" } });
      const res = makeRes();

      await eventController.listEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });
  });
});

describe("eventController.updateEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    eventService.updateEvent.mockResolvedValue(CREATED_EVENT);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("retorna 200 com os dados do evento atualizado", async () => {
    const req = makeReq({ params: { id: "uuid-event-123" }, body: VALID_BODY, user: VALID_USER });
    const res = makeRes();

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(CREATED_EVENT);
  });

  test("repassa id, body e usuário autenticado para o service", async () => {
    const body = {
      ...VALID_BODY,
      ended_at: "2026-04-11T04:00:00Z",
      instagram: "festarepublica",
      location: { latitude: -23.5, longitude: -46.6 },
      promoters: [{ name: "João", whatsapp: "11999999999" }],
    };
    const req = makeReq({ params: { id: "uuid-event-123" }, body, user: VALID_USER });
    const res = makeRes();

    await eventController.updateEvent(req, res);

    expect(eventService.updateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "uuid-event-123",
        name: "Festa do Republica",
        date: "2026-04-10T22:00:00Z",
        ended_at: "2026-04-11T04:00:00Z",
        instagram: "festarepublica",
        requesterUserId: "uuid-user-123",
        user_role: "institutional",
        location: { latitude: -23.5, longitude: -46.6 },
        promoters: [{ name: "João", whatsapp: "11999999999" }],
      })
    );
  });

  test("retorna 403 quando o service nega permissão", async () => {
    const error = new Error("Apenas o usuário que criou o evento pode editá-lo.");
    error.statusCode = 403;
    eventService.updateEvent.mockRejectedValue(error);

    const req = makeReq({ params: { id: "uuid-event-123" }, body: VALID_BODY, user: VALID_USER });
    const res = makeRes();

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });

  test("retorna 500 quando o service lança erro sem statusCode", async () => {
    eventService.updateEvent.mockRejectedValue(new Error("Connection refused"));

    const req = makeReq({ params: { id: "uuid-event-123" }, body: VALID_BODY, user: VALID_USER });
    const res = makeRes();

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});

describe("eventController.deleteEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    eventService.deleteEvent.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("retorna 204 quando remove o evento", async () => {
    const req = makeReq({ params: { id: "uuid-event-123" }, user: VALID_USER });
    const res = makeRes();

    await eventController.deleteEvent(req, res);

    expect(eventService.deleteEvent).toHaveBeenCalledWith({
      id: "uuid-event-123",
      requesterUserId: "uuid-user-123",
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test("retorna 403 quando o service nega permissão", async () => {
    const error = new Error("Apenas o usuário que criou o evento pode removê-lo.");
    error.statusCode = 403;
    eventService.deleteEvent.mockRejectedValue(error);

    const req = makeReq({ params: { id: "uuid-event-123" }, user: VALID_USER });
    const res = makeRes();

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });

  test("retorna 500 quando o service lança erro sem statusCode", async () => {
    eventService.deleteEvent.mockRejectedValue(new Error("Connection refused"));

    const req = makeReq({ params: { id: "uuid-event-123" }, user: VALID_USER });
    const res = makeRes();

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
