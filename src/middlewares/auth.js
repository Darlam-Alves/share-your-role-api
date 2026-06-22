const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

function authenticateIfPresent(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }

  return authenticate(req, res, next);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Sem permissão para realizar esta ação." });
    }
    next();
  };
}

module.exports = { authenticate, authenticateIfPresent, requireRole };
