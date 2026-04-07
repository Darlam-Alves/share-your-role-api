require("dotenv/config");

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);
app.use(eventRoutes);

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
