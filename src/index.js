require("dotenv/config");

const express = require("express");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(eventRoutes);

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
