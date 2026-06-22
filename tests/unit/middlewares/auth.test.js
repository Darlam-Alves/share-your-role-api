const { authenticate, authenticateIfPresent, requireRole } = require("../../../src/middlewares/auth");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

function makeReq({ headers = {}, user = undefined } = {}) {
  return { headers, user };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authenticate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("retorna 401 quando Authorization header não é enviado", () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido." });
    expect(next).not.toHaveBeenCalled();
  });

  test("retorna 401 quando header não começa com Bearer", () => {
    const req = makeReq({ headers: { authorization: "Basic token123" } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("retorna 401 quando token é inválido", () => {
    jwt.verify.mockImplementation(() => { throw new Error("invalid token"); });

    const req = makeReq({ headers: { authorization: "Bearer token-invalido" } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido ou expirado." });
    expect(next).not.toHaveBeenCalled();
  });

  test("chama next e atribui req.user quando token é válido", () => {
    const payload = { id: "uuid-user-123", role: "institutional", email_institutional_verified: false };
    jwt.verify.mockReturnValue(payload);

    const req = makeReq({ headers: { authorization: "Bearer token-valido" } });
    const res = makeRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("authenticateIfPresent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("permite acesso público quando o token não é enviado", () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();
    const next = jest.fn();

    authenticateIfPresent(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("atribui o usuário quando um token válido é enviado", () => {
    const payload = { id: "uuid-user-123", role: "public" };
    jwt.verify.mockReturnValue(payload);
    const req = makeReq({ headers: { authorization: "Bearer token-valido" } });
    const res = makeRes();
    const next = jest.fn();

    authenticateIfPresent(req, res, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  test("retorna 403 quando role do usuário não está na lista permitida", () => {
    const req = makeReq({ user: { role: "public" } });
    const res = makeRes();
    const next = jest.fn();

    requireRole("institutional", "admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("chama next quando role está na lista permitida", () => {
    const req = makeReq({ user: { role: "institutional" } });
    const res = makeRes();
    const next = jest.fn();

    requireRole("institutional", "admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("aceita múltiplos roles permitidos", () => {
    const req = makeReq({ user: { role: "admin" } });
    const res = makeRes();
    const next = jest.fn();

    requireRole("institutional", "admin")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
