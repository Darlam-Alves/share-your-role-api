require("dotenv/config");

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");
const authRoutes = require("./routes/auth");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  ...(process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];

const localDevOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || localDevOriginRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
}));
app.use(express.json({ limit: "4mb" }));
app.use(userRoutes);
app.use(authRoutes);
app.use(eventRoutes);

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";

  const server = app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
  });

  server.on("error", (error) => {
    console.error("Erro ao iniciar servidor:", error.message);
    process.exit(1);
  });
}
