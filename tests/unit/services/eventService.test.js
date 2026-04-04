const eventService = require("../../../src/services/eventService");
const eventRepository = require("../../../src/models/event");
const userRepository = require("../../../src/models/user");


jest.mock("../../../src/models/event");
jest.mock("../../../src/models/user");

const VALID_PAYLOAD = {
  name: "Festa do Republica",
  date: "2026-04-10T22:00:00Z",
  ended_at: "2026-04-11T04:00:00Z",
  visibility_type: "public",
  created_by_user_id: "uuid-user-123",
  instagram: "@festarepublica",
};

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

describe("eventService.createEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findById.mockResolvedValue({ id: "uuid-user-123", role: "institutional" });
    eventRepository.findRepublicMember.mockResolvedValue(null);
    eventRepository.create.mockResolvedValue(CREATED_EVENT);
  });

  describe("validação de campos obrigatórios", () => {
    test("lança erro 400 quando name não é enviado", async () => {
      const { name, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("name"),
      });
    });

    test("lança erro 400 quando name é string vazia", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, name: "   " })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("lança erro 400 quando date não é enviado", async () => {
      const { date, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("date"),
      });
    });

    test("lança erro 400 quando ended_at não é enviado", async () => {
      const { ended_at, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("ended_at"),
      });
    });

    test("lança erro 400 quando visibility_type não é enviado", async () => {
      const { visibility_type, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("visibility_type"),
      });
    });

    test("lança erro 400 quando created_by_user_id não é enviado", async () => {
      const { created_by_user_id, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("created_by_user_id"),
      });
    });
  });

  describe("validação da data", () => {
    test("lança erro 400 quando date não é uma data válida", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, date: "data-invalida" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("aceita date no formato ISO 8601", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, date: "2026-04-10T22:00:00Z" })
      ).resolves.toBeDefined();
    });
  });

  describe("validação de ended_at", () => {
    test("lança erro 400 quando ended_at não é uma data válida", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, ended_at: "data-invalida" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("ended_at") });
    });

    test("lança erro 400 quando ended_at é anterior a date", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-10T21:00:00Z",
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("3 horas") });
    });

    test("lança erro 400 quando ended_at é igual a date", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-10T22:00:00Z",
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("3 horas") });
    });

    test("lança erro 400 quando duração é menor que 3 horas", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-11T00:59:00Z",
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("3 horas") });
    });

    test("lança erro 400 quando duração é exatamente igual a 3 horas menos 1 segundo", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-11T00:59:59Z",
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("aceita ended_at com exatamente 3 horas de duração", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-11T01:00:00Z",
        })
      ).resolves.toBeDefined();
    });

    test("lança erro 400 quando duração é maior que 13 horas", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-11T11:00:01Z",
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("13 horas") });
    });

    test("aceita ended_at com exatamente 13 horas de duração", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          date: "2026-04-10T22:00:00Z",
          ended_at: "2026-04-11T11:00:00Z",
        })
      ).resolves.toBeDefined();
    });

    test("aceita ended_at válido e posterior a date", async () => {
      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });
  });

  describe("validação do visibility_type", () => {
    test("lança erro 400 para visibility_type inválido", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, visibility_type: "invalido" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test.each(["public", "institutional_only", "private"])(
      "aceita visibility_type '%s'",
      async (type) => {
        await expect(
          eventService.createEvent({ ...VALID_PAYLOAD, visibility_type: type })
        ).resolves.toBeDefined();
      }
    );
  });

  describe("validação de role do usuário", () => {
    test("lança erro 403 quando usuário tem role 'public'", async () => {
      userRepository.findById.mockResolvedValue({ id: "uuid-user-123", role: "public" });

      await expect(eventService.createEvent(VALID_PAYLOAD)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    test("lança erro 400 quando usuário não existe", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(eventService.createEvent(VALID_PAYLOAD)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Usuário não encontrado"),
      });
    });

    test("aceita role 'institutional'", async () => {
      userRepository.findById.mockResolvedValue({ id: "uuid-user-123", role: "institutional" });

      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });

    test("aceita role 'admin'", async () => {
      userRepository.findById.mockResolvedValue({ id: "uuid-user-123", role: "admin" });

      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });
  });

  describe("validação de membro da república", () => {
    const payloadWithRepublic = {
      ...VALID_PAYLOAD,
      created_by_republic_id: "uuid-republic-456",
    };

    test("lança erro 403 quando usuário não é membro da república", async () => {
      eventRepository.findRepublicMember.mockResolvedValue(null);

      await expect(eventService.createEvent(payloadWithRepublic)).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining("membro da república"),
      });
    });

    test("aceita quando usuário é membro da república", async () => {
      eventRepository.findRepublicMember.mockResolvedValue({ user_id: "uuid-user-123" });

      await expect(eventService.createEvent(payloadWithRepublic)).resolves.toBeDefined();
    });

    test("não verifica membros quando created_by_republic_id não é enviado", async () => {
      await eventService.createEvent(VALID_PAYLOAD);

      expect(eventRepository.findRepublicMember).not.toHaveBeenCalled();
    });
  });

  describe("validação de location", () => {
    test("lança erro 400 quando location não tem latitude", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          location: { longitude: -46.6 },
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("latitude") });
    });

    test("lança erro 400 quando location não tem longitude", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          location: { latitude: -23.5 },
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("longitude") });
    });

    test("aceita location sem address e release_at", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          location: { latitude: -23.5, longitude: -46.6 },
        })
      ).resolves.toBeDefined();
    });

    test("não valida location quando não é enviado", async () => {
      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });
  });

  describe("validação de promoters", () => {
    test("lança erro 400 quando promoters não é array", async () => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, promoters: "invalido" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("array") });
    });

    test("lança erro 400 quando algum promoter não tem name", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          promoters: [{ whatsapp: "11999999999" }],
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("name") });
    });

    test("lança erro 400 quando promoter não tem nenhum contato", async () => {
      await expect(
        eventService.createEvent({
          ...VALID_PAYLOAD,
          promoters: [{ name: "João" }],
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("contato") });
    });

    test.each([
      [{ name: "João", whatsapp: "19991234567" }],
      [{ name: "João", instagram: "@joao" }],
      [{ name: "João", telegram: "@joaotelegram" }],
    ])("aceita promoter com ao menos um contato", async (promoter) => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, promoters: [promoter] })
      ).resolves.toBeDefined();
    });

    test("não valida promoters quando não é enviado", async () => {
      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });
  });

  describe("normalização de inputs", () => {
    test("remove espaços extras do name", async () => {
      await eventService.createEvent({ ...VALID_PAYLOAD, name: "  Festa  " });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Festa" })
      );
    });

    test("remove espaços extras da description", async () => {
      await eventService.createEvent({ ...VALID_PAYLOAD, description: "  Descricao  " });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Descricao" })
      );
    });

    test("converte instagram para lowercase e mantém o @", async () => {
      await eventService.createEvent({ ...VALID_PAYLOAD, instagram: "@FESTAREPUBLICA" });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ instagram: "@festarepublica" })
      );
    });

    test("adiciona @ quando instagram é enviado sem ele", async () => {
      await eventService.createEvent({ ...VALID_PAYLOAD, instagram: "festarepublica" });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ instagram: "@festarepublica" })
      );
    });

    test("converte instagram de promoter para lowercase e mantém o @", async () => {
      await eventService.createEvent({
        ...VALID_PAYLOAD,
        promoters: [{ name: "João", instagram: "JOAO_PROMOTER" }],
      });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          promoters: expect.arrayContaining([
            expect.objectContaining({ instagram: "@joao_promoter" }),
          ]),
        })
      );
    });

    test("converte description vazia para null", async () => {
      await eventService.createEvent({ ...VALID_PAYLOAD, description: "   " });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null })
      );
    });

    test("passa a data convertida para objeto Date", async () => {
      await eventService.createEvent(VALID_PAYLOAD);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ date: expect.any(Date) })
      );
    });
  });

  describe("validação do formato do instagram", () => {
    test.each([
      ["com caracteres inválidos", "@festa republica"],
      ["com mais de 30 caracteres", "@" + "a".repeat(31)],
      ["somente @", "@"],
    ])("lança erro 400 quando instagram é %s", async (_, handle) => {
      await expect(
        eventService.createEvent({ ...VALID_PAYLOAD, instagram: handle })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Instagram") });
    });

    test("lança erro 400 quando instagram de promoter tem formato inválido", async () => {
      const { instagram, ...payload } = VALID_PAYLOAD;
      await expect(
        eventService.createEvent({
          ...payload,
          promoters: [{ name: "João", instagram: "@perfil inválido" }],
        })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Instagram") });
    });

    test.each([
      ["handle simples", "festarepublica", "@festarepublica"],
      ["já com @", "@festarepublica", "@festarepublica"],
      ["com ponto", "festa.republica", "@festa.republica"],
      ["com underscore", "festa_republica", "@festa_republica"],
      ["com números", "festa123", "@festa123"],
      ["com exatamente 30 caracteres", "a".repeat(30), "@" + "a".repeat(30)],
    ])("aceita instagram %s e normaliza para '%s'", async (_, input, expected) => {
      await eventService.createEvent({ ...VALID_PAYLOAD, instagram: input });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ instagram: expected })
      );
    });
  });

  describe("chamada ao repositório", () => {
    test("chama eventRepository.create com os campos normalizados", async () => {
      await eventService.createEvent(VALID_PAYLOAD);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Festa do Republica",
          visibilityType: "public",
          createdByUserId: "uuid-user-123",
        })
      );
    });

    test("chama eventRepository.create com location normalizada", async () => {
      await eventService.createEvent({
        ...VALID_PAYLOAD,
        location: { latitude: -23.5, longitude: -46.6, address: "  Rua X  " },
      });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          location: { latitude: -23.5, longitude: -46.6, address: "Rua X", release_at: null },
        })
      );
    });
  });

  describe("retorno", () => {
    test("retorna os dados do evento criado pelo repositório", async () => {
      const result = await eventService.createEvent(VALID_PAYLOAD);

      expect(result).toEqual(CREATED_EVENT);
    });

    test("propaga erros inesperados do repositório sem modificar", async () => {
      const dbError = new Error("Connection refused");
      eventRepository.create.mockRejectedValue(dbError);

      await expect(eventService.createEvent(VALID_PAYLOAD)).rejects.toBe(dbError);
    });

    test("lança erro 409 quando o repositório retorna P2002 (nome + data duplicados)", async () => {
      const prismaError = new Error("Unique constraint failed");
      prismaError.code = "P2002";
      eventRepository.create.mockRejectedValue(prismaError);

      await expect(eventService.createEvent(VALID_PAYLOAD)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining("nome"),
      });
    });
  });

  describe("validação de canal de contato", () => {
    test("lança erro 400 quando não há instagram nem promoter com contato", async () => {
      const { instagram, ...payload } = VALID_PAYLOAD;
      await expect(eventService.createEvent(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("instagram"),
      });
    });

    test("aceita quando evento tem instagram", async () => {
      await expect(eventService.createEvent(VALID_PAYLOAD)).resolves.toBeDefined();
    });

    test("aceita quando promoter tem whatsapp e evento não tem instagram", async () => {
      const { instagram, ...payload } = VALID_PAYLOAD;
      await expect(
        eventService.createEvent({
          ...payload,
          promoters: [{ name: "João", whatsapp: "19999999999" }],
        })
      ).resolves.toBeDefined();
    });

    test("aceita quando promoter tem instagram e evento não tem instagram", async () => {
      const { instagram, ...payload } = VALID_PAYLOAD;
      await expect(
        eventService.createEvent({
          ...payload,
          promoters: [{ name: "João", instagram: "@joao_promoter" }],
        })
      ).resolves.toBeDefined();
    });

    test("lança erro 400 quando promoters têm apenas name, sem contato, e evento não tem instagram", async () => {
      const { instagram, ...payload } = VALID_PAYLOAD;
      await expect(
        eventService.createEvent({
          ...payload,
          promoters: [{ name: "João" }],
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("derivação de ticket_platform a partir de ticket_url", () => {
    test.each([
      ["https://blacktag.com.br/evento", "Blacktag"],
      ["https://byma.com.br/evento", "Byma"],
      ["https://sympla.com.br/evento", "Sympla"],
      ["https://www.eventbrite.com/e/123", "Eventbrite"],
      ["https://ingresse.com/evento", "Ingresse"],
    ])("deriva '%s' para '%s'", async (url, expectedPlatform) => {
      await eventService.createEvent({ ...VALID_PAYLOAD, ticket_url: url });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketPlatform: expectedPlatform })
      );
    });

    test("usa o hostname como platform quando a URL não é conhecida", async () => {
      await eventService.createEvent({
        ...VALID_PAYLOAD,
        ticket_url: "https://minhaticketeira.com.br/evento",
      });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketPlatform: "minhaticketeira.com.br" })
      );
    });

    test("passa ticketPlatform null quando ticket_url não é enviado", async () => {
      await eventService.createEvent(VALID_PAYLOAD);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketPlatform: null })
      );
    });

    test("ignora ticket_platform enviado no payload e deriva da URL", async () => {
      await eventService.createEvent({
        ...VALID_PAYLOAD,
        ticket_url: "https://blacktag.com.br/evento",
        ticket_platform: "Qualquer Coisa",
      });

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketPlatform: "Blacktag" })
      );
    });
  });
});

describe("eventService.listEvents", () => {
  const VALID_PARAMS = {
    start_date: "2026-04-03",
    end_date: "2026-04-09",
  };

  const makeEvent = (overrides = {}) => ({
    id: "uuid-event-1",
    name: "Festa do Republica",
    description: null,
    date: new Date("2026-04-08T22:00:00Z"),
    ended_at: new Date("2026-04-09T04:00:00Z"),
    visibility_type: "public",
    instagram: null,
    ticket_platform: null,
    ticket_url: null,
    created_by_user_id: "uuid-user-123",
    created_by_republic_id: null,
    created_at: new Date("2026-04-01T00:00:00Z"),
    event_location: null,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    eventRepository.list.mockResolvedValue([]);
  });

  describe("validação de parâmetros", () => {
    test("lança erro 400 quando start_date não é enviado", async () => {
      await expect(
        eventService.listEvents({ end_date: "2026-04-09" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("start_date") });
    });

    test("lança erro 400 quando end_date não é enviado", async () => {
      await expect(
        eventService.listEvents({ start_date: "2026-04-03" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("end_date") });
    });

    test("lança erro 400 quando start_date não está no formato YYYY-MM-DD", async () => {
      await expect(
        eventService.listEvents({ ...VALID_PARAMS, start_date: "03/04/2026" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("start_date") });
    });

    test("lança erro 400 quando end_date não está no formato YYYY-MM-DD", async () => {
      await expect(
        eventService.listEvents({ ...VALID_PARAMS, end_date: "09/04/2026" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("end_date") });
    });

    test("lança erro 400 quando end_date é anterior a start_date", async () => {
      await expect(
        eventService.listEvents({ start_date: "2026-04-09", end_date: "2026-04-03" })
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("end_date") });
    });

    test("aceita parâmetros válidos", async () => {
      await expect(eventService.listEvents(VALID_PARAMS)).resolves.toBeDefined();
    });
  });

  describe("filtro de visibilidade", () => {
    test("chama o repositório com public e institutional_only", async () => {
      await eventService.listEvents(VALID_PARAMS);

      expect(eventRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({ visibilityTypes: ["public", "institutional_only"] })
      );
    });
  });

  describe("localização de eventos institutional_only", () => {
    const institutionalEvent = () =>
      makeEvent({
        visibility_type: "institutional_only",
        event_location: {
          address: "Rua das Repúblicas, 42",
          latitude: "-22.814500",
          longitude: "-47.068800",
          release_at: null,
        },
      });

    test("retorna location null para institutional_only sem token verificado", async () => {
      eventRepository.list.mockResolvedValue([institutionalEvent()]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location).toBeNull();
    });

    test("retorna localização completa para institutional_only com token verificado", async () => {
      eventRepository.list.mockResolvedValue([institutionalEvent()]);

      const [event] = await eventService.listEvents({
        ...VALID_PARAMS,
        institutionalVerified: true,
      });

      expect(event.location.latitude).toBeDefined();
      expect(event.location.longitude).toBeDefined();
      expect(event.location.address).toBeDefined();
    });

    test("eventos public não são afetados pela verificação institucional", async () => {
      eventRepository.list.mockResolvedValue([
        makeEvent({
          event_location: {
            address: "Rua X, 123",
            latitude: "-22.004612",
            longitude: "-47.890978",
            release_at: null,
          },
        }),
      ]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location.latitude).toBeDefined();
    });
  });

  describe("lógica de embargo de localização", () => {
    test("inclui lat/lng quando release_at é null", async () => {
      eventRepository.list.mockResolvedValue([
        makeEvent({
          event_location: {
            address: "Rua X, 123",
            latitude: "-22.004612",
            longitude: "-47.890978",
            release_at: null,
          },
        }),
      ]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location.latitude).toBeDefined();
      expect(event.location.longitude).toBeDefined();
    });

    test("inclui lat/lng quando release_at já passou", async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      eventRepository.list.mockResolvedValue([
        makeEvent({
          event_location: {
            address: "Rua X, 123",
            latitude: "-22.004612",
            longitude: "-47.890978",
            release_at: pastDate,
          },
        }),
      ]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location.latitude).toBeDefined();
      expect(event.location.longitude).toBeDefined();
    });

    test("omite lat/lng quando release_at é no futuro", async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      eventRepository.list.mockResolvedValue([
        makeEvent({
          event_location: {
            address: "Rua X, 123",
            latitude: "-22.004612",
            longitude: "-47.890978",
            release_at: futureDate,
          },
        }),
      ]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location.address).toBe("Rua X, 123");
      expect(event.location.latitude).toBeUndefined();
      expect(event.location.longitude).toBeUndefined();
    });

    test("retorna location null quando evento não tem localização", async () => {
      eventRepository.list.mockResolvedValue([makeEvent({ event_location: null })]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.location).toBeNull();
    });
  });

  describe("retorno", () => {
    test("retorna lista vazia quando não há eventos no período", async () => {
      eventRepository.list.mockResolvedValue([]);

      const result = await eventService.listEvents(VALID_PARAMS);

      expect(result).toEqual([]);
    });

    test("retorna eventos sem o campo event_location no formato original", async () => {
      eventRepository.list.mockResolvedValue([makeEvent()]);

      const [event] = await eventService.listEvents(VALID_PARAMS);

      expect(event.event_location).toBeUndefined();
      expect(event.location).toBeNull();
    });
  });
});
