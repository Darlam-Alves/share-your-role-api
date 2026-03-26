require("dotenv/config");

const express = require("express");
const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());
app.use(userRoutes);

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}
