jest.mock("../../../src/config/prisma", () => ({
  resales: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

const prisma = require("../../../src/config/prisma");
const eventController = require("../../../src/controllers/event");

function makeReq({ body = {}, params = {}, user = {} } = {}) {
  return { body, params, user };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const SOLD_RESALE = {
  id: "resale-sold",
  user_id: "user-1",
  event_id: "event-1",
  price: 75,
  quantity: 1,
  status: "sold",
};

describe("eventController.updateEventResale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("impede retomar anúncio vendido quando já existe outro anúncio aberto", async () => {
    prisma.resales.findUnique.mockResolvedValue(SOLD_RESALE);
    prisma.resales.findFirst.mockResolvedValue({ id: "resale-open" });
    const req = makeReq({
      params: { id: SOLD_RESALE.id },
      user: { id: SOLD_RESALE.user_id },
      body: { status: "open" },
    });
    const res = makeRes();

    await eventController.updateEventResale(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Você já possui um anúncio ativo de revenda para este evento.",
    });
    expect(prisma.resales.update).not.toHaveBeenCalled();
  });

  test("retoma o anúncio vendido quando não há outro anúncio aberto", async () => {
    prisma.resales.findUnique.mockResolvedValue(SOLD_RESALE);
    prisma.resales.findFirst.mockResolvedValue(null);
    prisma.resales.update.mockResolvedValue({ ...SOLD_RESALE, status: "open" });
    const req = makeReq({
      params: { id: SOLD_RESALE.id },
      user: { id: SOLD_RESALE.user_id },
      body: { status: "open" },
    });
    const res = makeRes();

    await eventController.updateEventResale(req, res);

    expect(prisma.resales.update).toHaveBeenCalledWith({
      where: { id: SOLD_RESALE.id },
      data: {
        price: SOLD_RESALE.price,
        quantity: SOLD_RESALE.quantity,
        status: "open",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
